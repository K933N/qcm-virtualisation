$ErrorActionPreference = "Stop"

function Read-TextFile {
  param([string]$Path)

  $bytes = [System.IO.File]::ReadAllBytes($Path)
  return [System.Text.Encoding]::GetEncoding(1252).GetString($bytes)
}

function Repair-Mojibake {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return ""
  }

  $text = $Value -replace "`r`n", "`n" -replace [char]0x00A0, " "
  try {
    $bytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($text)
    $converted = [System.Text.Encoding]::UTF8.GetString($bytes)
    if ($converted) {
      $text = $converted
    }
  } catch {
  }

  $text = $text.Replace(" $([char]0xFFFD)  ", " $([char]0x00E0) ")
  $text = $text.Replace(" $([char]0xFFFD) ", " $([char]0x00E0) ")
  return (($text -replace [string][char]0x2019, "'" -replace [string][char]0x0153, "oe" -replace [string][char]0x0152, "Oe" -replace [string][char]0xFFFD, "a") -replace "\s{2,}", " ").Trim()
}

function Normalize-Line {
  param([string]$Value)

  return (Repair-Mojibake $Value).Trim()
}

function Normalize-KeyPart {
  param([string]$Value)

  $normalized = (Normalize-Line $Value).ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
  $chars = New-Object System.Collections.Generic.List[char]
  foreach ($char in $normalized.ToCharArray()) {
    if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($char) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      $chars.Add($char)
    }
  }
  return ((-join $chars.ToArray()) -replace "[^a-z0-9]+", " ").Trim()
}

function Parse-QuestionBlocks {
  param(
    [string]$RawText,
    [string]$IdPrefix,
    [scriptblock]$FlagResolver
  )

  $lines = ($RawText -split "`r?`n") | ForEach-Object { Normalize-Line $_ }
  $questions = New-Object System.Collections.Generic.List[object]
  $index = 0

  while ($index -lt $lines.Length) {
    $line = $lines[$index]
    if ($line -notmatch "^(Question|QCM)\s+\d+") {
      $index += 1
      continue
    }

    $number = [int](([regex]::Match($line, "(\d+)")).Groups[1].Value)
    $index += 1

    $promptParts = New-Object System.Collections.Generic.List[string]
    while ($index -lt $lines.Length) {
      $current = $lines[$index]
      if (-not $current) {
        $index += 1
        if ($promptParts.Count -gt 0) { break }
        continue
      }
      if ($current -match "^[A-D][\.\)]\s*") {
        break
      }
      $promptParts.Add($current)
      $index += 1
    }

    $prompt = ($promptParts -join " ").Trim()
    if (-not $prompt) {
      continue
    }

    $options = New-Object System.Collections.Generic.List[string]
    $letters = New-Object System.Collections.Generic.List[string]
    $currentOption = $null
    while ($index -lt $lines.Length) {
      $current = $lines[$index]
      if (-not $current) {
        $index += 1
        continue
      }
      if ($current -match "^(Bonne|Bonnes)\s+r\S*ponses?\s*:|^Explication\s*:|^(Question|QCM)\s+\d+") {
        break
      }
      $match = [regex]::Match($current, "^([A-D])[\.\)]\s*(.*)$")
      if ($match.Success) {
        $letters.Add($match.Groups[1].Value.ToUpperInvariant())
        $options.Add($match.Groups[2].Value.Trim())
        $currentOption = $options.Count - 1
        $index += 1
        continue
      }
      if ($null -ne $currentOption) {
        $options[$currentOption] = "$($options[$currentOption]) $current".Trim()
      }
      $index += 1
    }

    $answerLetters = @()
    if ($index -lt $lines.Length -and $lines[$index] -match "^(Bonne|Bonnes)\s+r\S*ponses?\s*:\s*(.+)$") {
      $answerLetters = (($Matches[2] -split "[,;/ ]+") | ForEach-Object { ($_ -replace "[^A-D]", "").ToUpperInvariant() }) | Where-Object { $_ }
      $index += 1
    }

    $explanation = $null
    if ($index -lt $lines.Length -and $lines[$index] -match "^Explication\s*:\s*(.*)$") {
      $parts = New-Object System.Collections.Generic.List[string]
      if ($Matches[1].Trim()) {
        $parts.Add($Matches[1].Trim())
      }
      $index += 1
      while ($index -lt $lines.Length -and $lines[$index] -notmatch "^(Question|QCM)\s+\d+") {
        if ($lines[$index]) {
          $parts.Add($lines[$index])
        }
        $index += 1
      }
      if ($parts.Count -gt 0) {
        $explanation = ($parts -join " ").Trim()
      }
    }

    if ($options.Count -lt 4 -or $answerLetters.Count -eq 0) {
      continue
    }

    $answers = New-Object System.Collections.Generic.List[string]
    foreach ($answerLetter in ($answerLetters | Select-Object -Unique)) {
      $answerIndex = [Array]::IndexOf($letters.ToArray(), $answerLetter)
      if ($answerIndex -ge 0 -and $answerIndex -lt $options.Count) {
        $answers.Add($options[$answerIndex])
      }
    }

    if ($answers.Count -eq 0) {
      continue
    }

    $flags = & $FlagResolver $number
    $questions.Add([ordered]@{
      id = "$IdPrefix-$number"
      categoryId = "securite-aps"
      prompt = $prompt
      options = @($options.ToArray())
      answers = @($answers.ToArray())
      explanation = $explanation
      isPriority = [bool]$flags.isPriority
      isFrequent40 = [bool]$flags.isFrequent40
      isEssential120 = [bool]$flags.isEssential120
      source = "embedded"
    })
  }

  return $questions
}

function Get-QuestionKey {
  param($Question)

  $parts = New-Object System.Collections.Generic.List[string]
  $parts.Add((Normalize-KeyPart $Question.prompt))
  foreach ($option in ($Question.options | ForEach-Object { Normalize-KeyPart $_ } | Sort-Object)) {
    $parts.Add($option)
  }
  return ($parts -join "|")
}

function Merge-DuplicateQuestions {
  param([object[]]$Questions)

  $merged = New-Object System.Collections.Generic.List[object]
  $byKey = @{}

  foreach ($question in $Questions) {
    $key = Get-QuestionKey $question
    if ($byKey.ContainsKey($key)) {
      $existing = $byKey[$key]
      if (-not $existing.explanation -or (($question.explanation | Out-String).Trim().Length -gt ($existing.explanation | Out-String).Trim().Length)) {
        $existing.explanation = $question.explanation
      }
      $existing.isFrequent40 = $existing.isFrequent40 -or $question.isFrequent40
      $existing.isEssential120 = $existing.isEssential120 -or $question.isEssential120
      $existing.isPriority = $existing.isPriority -or $question.isPriority -or $existing.isFrequent40 -or $existing.isEssential120
      continue
    }

    $copy = [ordered]@{
      id = $question.id
      categoryId = $question.categoryId
      prompt = $question.prompt
      options = @($question.options)
      answers = @($question.answers)
      explanation = $question.explanation
      isPriority = [bool]$question.isPriority
      isFrequent40 = [bool]$question.isFrequent40
      isEssential120 = [bool]$question.isEssential120
      source = "embedded"
    }
    $byKey[$key] = $copy
    $merged.Add($copy)
  }

  return $merged
}

$virtualisation = @(
  [ordered]@{
    id = "virt-1"
    categoryId = "virtualisation"
    prompt = "La virtualisation consiste a :"
    options = @(
      "Emuler une architecture materielle physique en plusieurs environnements logiques",
      "Supprimer le materiel physique",
      "Transformer un NAS en SAN",
      "Remplacer la RAM par le stockage"
    )
    answers = @("Emuler une architecture materielle physique en plusieurs environnements logiques")
    explanation = "La virtualisation permet de creer des machines virtuelles logiques a partir d'un materiel physique unique."
    isPriority = $false
    isFrequent40 = $false
    isEssential120 = $false
    source = "embedded"
  },
  [ordered]@{
    id = "virt-2"
    categoryId = "virtualisation"
    prompt = "Un hyperviseur de type 1 s'installe :"
    options = @(
      "Directement sur le materiel physique",
      "Sur Windows uniquement",
      "Dans une machine virtuelle",
      "Dans un switch"
    )
    answers = @("Directement sur le materiel physique")
    explanation = "Un hyperviseur de type 1 fonctionne directement sur le serveur physique, sans systeme d'exploitation classique au-dessus."
    isPriority = $false
    isFrequent40 = $false
    isEssential120 = $false
    source = "embedded"
  },
  [ordered]@{
    id = "virt-3"
    categoryId = "virtualisation"
    prompt = "Quelles ressources sont le plus souvent virtualisees ?"
    options = @("CPU", "RAM", "Stockage", "Reseau")
    answers = @("CPU", "RAM", "Stockage", "Reseau")
    explanation = "Les ressources principales virtualisees sont le processeur, la memoire, le stockage et le reseau."
    isPriority = $false
    isFrequent40 = $false
    isEssential120 = $false
    source = "embedded"
  },
  [ordered]@{
    id = "virt-4"
    categoryId = "virtualisation"
    prompt = "Le fichier .vmx correspond a :"
    options = @(
      "La configuration principale de la machine virtuelle",
      "Le BIOS physique du serveur",
      "Le disque reel du NAS",
      "Le delta du snapshot"
    )
    answers = @("La configuration principale de la machine virtuelle")
    explanation = "Le fichier .vmx contient les parametres de la machine virtuelle."
    isPriority = $false
    isFrequent40 = $false
    isEssential120 = $false
    source = "embedded"
  },
  [ordered]@{
    id = "virt-5"
    categoryId = "virtualisation"
    prompt = "Un snapshot sert surtout a :"
    options = @(
      "Faire un retour arriere temporaire",
      "Remplacer une sauvegarde complete",
      "Augmenter la RAM physique",
      "Supprimer le systeme invite"
    )
    answers = @("Faire un retour arriere temporaire")
    explanation = "Un snapshot capture l'etat d'une VM a un instant T mais ne remplace pas une vraie sauvegarde."
    isPriority = $false
    isFrequent40 = $false
    isEssential120 = $false
    source = "embedded"
  }
)

$apsMainPath = "D:\APS_QCM_340_questions.txt"
$apsEssentialPath = "D:\APS_120_questions_essentielles.txt"

$apsMain = Parse-QuestionBlocks (Read-TextFile $apsMainPath) "aps-main" {
  param($Number)
  $isFrequent40 = $Number -gt 300
  [ordered]@{
    isPriority = $isFrequent40
    isFrequent40 = $isFrequent40
    isEssential120 = $false
  }
}

$apsEssential = Parse-QuestionBlocks (Read-TextFile $apsEssentialPath) "aps-essential" {
  param($Number)
  [ordered]@{
    isPriority = $true
    isFrequent40 = $false
    isEssential120 = $true
  }
}

$apsQuestions = Merge-DuplicateQuestions @($apsMain + $apsEssential)
$allQuestions = @($virtualisation + $apsQuestions)

$data = [ordered]@{
  categories = @(
    [ordered]@{ id = "virtualisation"; name = "Virtualisation"; source = "embedded" },
    [ordered]@{ id = "securite-aps"; name = "Securite APS"; source = "embedded" }
  )
  questions = $allQuestions
}

$json = $data | ConvertTo-Json -Depth 8
$output = "window.DEFAULT_QUIZ_DATA = $json;"
Set-Content -Path "D:\CODE\questions-data.js" -Value $output -Encoding UTF8

Write-Output "questions-data.js genere. Virtualisation: $($virtualisation.Count) | APS dedupliquees: $($apsQuestions.Count)"
