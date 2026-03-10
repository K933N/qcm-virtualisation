const QUESTION_BANK = [
  { prompt: "La virtualisation consiste a :", options: ["Supprimer le materiel physique", "Emuler une architecture materielle physique en une ou plusieurs architectures logiques", "Transformer un NAS en SAN", "Remplacer la RAM par un disque dur"], answer: "Emuler une architecture materielle physique en une ou plusieurs architectures logiques" },
  { prompt: "Les 4 ressources principales virtualisees sont :", options: ["CPU, RAM, stockage, reseau", "CPU, clavier, souris, ecran", "RAM, BIOS, imprimante, reseau", "Disque, ecran, clavier, souris"], answer: "CPU, RAM, stockage, reseau" },
  { prompt: "Une machine virtuelle est :", options: ["Un cable reseau logique", "Un ordinateur physique demonte", "Un ordinateur logique constitue d'un ensemble de fichiers", "Un fichier texte stocke sur un NAS"], answer: "Un ordinateur logique constitue d'un ensemble de fichiers" },
  { prompt: "L'hyperviseur permet de :", options: ["Creer et gerer des machines virtuelles", "Remplacer le processeur", "Configurer automatiquement Internet", "Changer le systeme d'exploitation d'un NAS"], answer: "Creer et gerer des machines virtuelles" },
  { prompt: "Un hyperviseur de type 1 s'installe :", options: ["Sur un systeme Windows obligatoire", "Directement sur le materiel physique", "Dans une machine virtuelle", "Seulement sur Linux"], answer: "Directement sur le materiel physique" },
  { prompt: "Un hyperviseur de type 2 s'installe :", options: ["Directement sur le BIOS", "Dans un switch", "Sur un systeme d'exploitation existant", "Dans un datastore uniquement"], answer: "Sur un systeme d'exploitation existant" },
  { prompt: "Lequel est un hyperviseur de type 1 ?", options: ["VirtualBox", "VMware Workstation", "VMware ESXi", "Google Chrome"], answer: "VMware ESXi" },
  { prompt: "Lequel est un hyperviseur de type 2 ?", options: ["Proxmox VE", "VMware ESXi", "Hyper-V Server", "VirtualBox"], answer: "VirtualBox" },
  { prompt: "Le VMkernel est :", options: ["Le noyau de VMware ESXi", "Le disque dur virtuel", "Le BIOS d'une machine physique", "Un protocole reseau"], answer: "Le noyau de VMware ESXi" },
  { prompt: "Le role du VMkernel est de :", options: ["Gerer les ressources CPU, RAM, stockage et reseau", "Remplacer le datastore", "Supprimer les snapshots", "Configurer le DNS public"], answer: "Gerer les ressources CPU, RAM, stockage et reseau" },
  { prompt: "La RAM physique attribuee a une machine virtuelle devient :", options: ["du vDisk", "de la vRAM", "du vSAN", "du flat"], answer: "de la vRAM" },
  { prompt: "Le processeur virtuel d'une VM est appele :", options: ["vCPU", "vRAM", "vNICD", "vSWAP"], answer: "vCPU" },
  { prompt: "L'hote correspond a :", options: ["Le systeme installe dans la VM", "Le serveur physique ou l'hyperviseur qui heberge les VM", "Le nom de domaine complet", "Le snapshot courant"], answer: "Le serveur physique ou l'hyperviseur qui heberge les VM" },
  { prompt: "L'invite correspond a :", options: ["La carte reseau physique", "Le systeme d'exploitation installe dans la VM", "Le datastore", "Le cluster"], answer: "Le systeme d'exploitation installe dans la VM" },
  { prompt: "SAN signifie :", options: ["System Area Network", "Storage Attached Network", "Storage Area Network", "Shared Area Node"], answer: "Storage Area Network" },
  { prompt: "Un SAN permet :", options: ["De partager des fichiers personnels entre utilisateurs seulement", "Aux serveurs d'acceder a un stockage centralise comme a des disques locaux", "D'installer Windows", "De remplacer le CPU"], answer: "Aux serveurs d'acceder a un stockage centralise comme a des disques locaux" },
  { prompt: "NAS signifie :", options: ["Network Attached Storage", "New Area System", "Network Access System", "Native Attached Storage"], answer: "Network Attached Storage" },
  { prompt: "Un NAS est surtout utilise pour :", options: ["Le partage de fichiers", "Le remplacement du BIOS", "La virtualisation du processeur", "La creation de snapshots systeme VMware uniquement"], answer: "Le partage de fichiers" },
  { prompt: "Dans ESXi, l'espace de stockage logique utilise pour les VM s'appelle :", options: ["BIOS", "datastore", "vCPU", "inventaire"], answer: "datastore" },
  { prompt: "Un datastore peut contenir :", options: ["Les fichiers de VM", "Les snapshots", "Les fichiers de swap", "Toutes les reponses ci-dessus"], answer: "Toutes les reponses ci-dessus" },
  { prompt: "FQDN signifie :", options: ["Fully Qualified Domain Name", "Fast Query Domain Node", "Full Quality Data Name", "File Queue Domain Network"], answer: "Fully Qualified Domain Name" },
  { prompt: "Dans le FQDN www.google.com :", options: ["www est le datastore", "google.com est le disque systeme", "www est le nom d'hote ou service", "google.com est le nom du snapshot"], answer: "www est le nom d'hote ou service" },
  { prompt: "Le fichier .vmx correspond :", options: ["Au fichier de configuration principal de la VM", "Au fichier contenant les donnees reelles du disque", "Au fichier BIOS de la VM", "Au fichier snapshot delta"], answer: "Au fichier de configuration principal de la VM" },
  { prompt: "Le fichier .vmdk correspond :", options: ["Au noyau ESXi", "Au disque virtuel de la machine virtuelle", "Au fichier de pause", "Au nom de domaine"], answer: "Au disque virtuel de la machine virtuelle" },
  { prompt: "Le fichier -flat.vmdk contient :", options: ["Les parametres BIOS", "Les donnees reelles du disque virtuel", "Les informations de snapshot", "Les logs reseau uniquement"], answer: "Les donnees reelles du disque virtuel" },
  { prompt: "Le fichier .nvram contient :", options: ["Les parametres BIOS ou UEFI de la VM", "Le swap VMware", "Le delta du snapshot", "Le processeur virtuel"], answer: "Les parametres BIOS ou UEFI de la VM" },
  { prompt: "Le fichier .vswp est :", options: ["Le fichier de configuration", "Le fichier de swap VMware", "Le snapshot principal", "Le fichier de cluster"], answer: "Le fichier de swap VMware" },
  { prompt: "Le fichier .vmss sert a :", options: ["Enregistrer l'etat d'une VM suspendue", "Decrire le disque principal", "Remplacer le .vmx", "Gerer le FQDN"], answer: "Enregistrer l'etat d'une VM suspendue" },
  { prompt: "Le fichier .vmsn contient :", options: ["L'etat de la VM au moment d'un snapshot", "Le BIOS de la VM", "La liste des utilisateurs", "La RAM physique du serveur"], answer: "L'etat de la VM au moment d'un snapshot" },
  { prompt: "Le fichier .vmsd sert a :", options: ["Organiser et lister les snapshots", "Contenir les donnees du disque principal", "Gerer la carte reseau physique", "Remplacer le swap"], answer: "Organiser et lister les snapshots" },
  { prompt: "Charger une configuration dans l'inventaire signifie :", options: ["Supprimer le fichier .vmx", "Ajouter le fichier .vmx de la VM dans l'inventaire de l'hyperviseur", "Deplacer la RAM dans le datastore", "Convertir un SAN en NAS"], answer: "Ajouter le fichier .vmx de la VM dans l'inventaire de l'hyperviseur" },
  { prompt: "L'inventaire de l'hyperviseur est :", options: ["La liste des VM connues et administrables", "Le disque physique principal", "Le BIOS du serveur", "Le protocole de snapshot"], answer: "La liste des VM connues et administrables" },
  { prompt: "Un disque thick est un disque :", options: ["Dynamique", "Statique", "Forcement reseau", "Qui ne reserve jamais l'espace"], answer: "Statique" },
  { prompt: "Avec un disque thick :", options: ["L'espace est reserve immediatement", "L'espace grandit seulement a l'usage", "Aucun espace n'est reserve", "Le disque n'existe pas reellement"], answer: "L'espace est reserve immediatement" },
  { prompt: "Un disque thin est :", options: ["Un disque statique", "Un disque qui reserve toute la capacite au depart", "Un disque dynamique qui grandit selon l'usage", "Un disque reserve aux snapshots"], answer: "Un disque dynamique qui grandit selon l'usage" },
  { prompt: "L'avantage principal du thin provisioning est :", options: ["Une consommation totale immediate du stockage", "L'economie d'espace", "Une suppression automatique des VM", "L'absence de risque sur le datastore"], answer: "L'economie d'espace" },
  { prompt: "Le risque principal du thin provisioning est :", options: ["L'explosion du processeur", "La saturation du datastore si plusieurs VM grandissent", "La suppression du BIOS", "L'arret definitif du reseau physique"], answer: "La saturation du datastore si plusieurs VM grandissent" },
  { prompt: "L'initialisation d'un disque consiste a :", options: ["Changer le nom de la VM", "Mettre les blocs du disque a zero", "Supprimer le datastore", "Desactiver le swap"], answer: "Mettre les blocs du disque a zero" },
  { prompt: "En Thick Eager Zeroed :", options: ["Les blocs sont initialises au premier usage uniquement", "L'espace est reserve plus tard", "L'espace est reserve immediatement et les blocs sont initialises des la creation", "Le disque fonctionne comme un thin"], answer: "L'espace est reserve immediatement et les blocs sont initialises des la creation" },
  { prompt: "En Thick Lazy Zeroed :", options: ["Les blocs sont initialises uniquement lorsqu'ils sont utilises", "L'espace n'est jamais reserve", "Le disque est forcement suspendu", "Le .vmx est supprime"], answer: "Les blocs sont initialises uniquement lorsqu'ils sont utilises" },
  { prompt: "Lequel cree le disque le plus rapidement ?", options: ["Thick Eager Zeroed", "Thick Lazy Zeroed", "Le SAN", "Le cluster"], answer: "Thick Lazy Zeroed" },
  { prompt: "Le swap sert a :", options: ["Utiliser un espace disque comme memoire temporaire", "Remplacer le CPU", "Creer automatiquement un snapshot", "Ajouter un FQDN a une VM"], answer: "Utiliser un espace disque comme memoire temporaire" },
  { prompt: "Sous Windows, le fichier de swap est generalement :", options: ["swap.txt", "pagefile.sys", "system.swap.net", "memdisk.vmx"], answer: "pagefile.sys" },
  { prompt: "Sous Linux, le swap peut etre :", options: ["Une partition swap ou un fichier swap", "Seulement un snapshot", "Un BIOS reseau", "Un fichier .vmss uniquement"], answer: "Une partition swap ou un fichier swap" },
  { prompt: "Dans VMware, le fichier .vswp est :", options: ["Cree au demarrage de la VM et supprime a son arret", "Cree uniquement au snapshot", "Permanent meme VM arretee", "Un fichier de configuration BIOS"], answer: "Cree au demarrage de la VM et supprime a son arret" },
  { prompt: "La suspension d'une VM permet :", options: ["De supprimer definitivement son etat", "De reprendre plus tard la VM dans son etat exact", "De la transformer en NAS", "De l'ajouter au SAN"], answer: "De reprendre plus tard la VM dans son etat exact" },
  { prompt: "Un probleme de suspension ou de pause peut venir :", options: ["D'un manque d'espace sur le datastore", "D'un mode veille laisse actif", "D'un probleme de stockage", "Toutes les reponses ci-dessus"], answer: "Toutes les reponses ci-dessus" },
  { prompt: "Un snapshot est :", options: ["Une sauvegarde complete et definitive", "Une capture de l'etat d'une VM a un instant T", "Un type de datastore", "Un fichier BIOS"], answer: "Une capture de l'etat d'une VM a un instant T" },
  { prompt: "Un snapshot sert principalement a :", options: ["Remplacer les sauvegardes", "Faire un retour arriere apres modification ou test", "Augmenter la RAM physique", "Supprimer le systeme invite"], answer: "Faire un retour arriere apres modification ou test" },
  { prompt: "Un snapshot ne doit pas etre garde trop longtemps car :", options: ["Il remplace le processeur", "Il peut grossir et degrader les performances", "Il supprime le SAN", "Il desactive le VMkernel"], answer: "Il peut grossir et degrader les performances" },
  { prompt: "Dans ton cours, il est recommande de ne pas garder un snapshot plus de :", options: ["30 jours", "7 jours", "24 heures en production", "1 an"], answer: "24 heures en production" },
  { prompt: "Le delta correspond :", options: ["Au disque principal d'origine", "Au fichier qui enregistre les modifications apres le snapshot", "Au BIOS de la VM", "Au nom complet de domaine"], answer: "Au fichier qui enregistre les modifications apres le snapshot" },
  { prompt: "La consolidation permet :", options: ["De reinjecter les donnees du delta dans le disque principal", "De supprimer la RAM physique", "De creer un FQDN", "D'installer un hyperviseur de type 2"], answer: "De reinjecter les donnees du delta dans le disque principal" },
  { prompt: "Un cluster de virtualisation est :", options: ["Un seul disque tres gros", "Un groupe de plusieurs hotes travaillant ensemble", "Un seul snapshot partage", "Une carte reseau virtuelle"], answer: "Un groupe de plusieurs hotes travaillant ensemble" },
  { prompt: "Un cluster permet notamment :", options: ["La repartition des charges", "Une meilleure disponibilite", "La continuite de service", "Toutes les reponses ci-dessus"], answer: "Toutes les reponses ci-dessus" },
  { prompt: "La migration d'une VM consiste a :", options: ["Supprimer la VM", "Deplacer une VM d'un hote a un autre", "Convertir un fichier .vmx en .vmdk", "Changer son FQDN uniquement"], answer: "Deplacer une VM d'un hote a un autre" },
  { prompt: "La migration d'une VM peut etre utilisee pour :", options: ["Equilibrer la charge", "Faire de la maintenance", "Ameliorer la disponibilite", "Toutes les reponses ci-dessus"], answer: "Toutes les reponses ci-dessus" },
  { prompt: "Lequel est une solution de virtualisation open source ?", options: ["Proxmox VE", "VMware Workstation Pro uniquement", "Windows Update", "Google Drive"], answer: "Proxmox VE" },
  { prompt: "Hyper-V est :", options: ["Une solution de virtualisation Microsoft", "Un NAS", "Un fichier VMware", "Un FQDN"], answer: "Une solution de virtualisation Microsoft" },
  { prompt: "VMware ESXi est surtout utilise :", options: ["Comme logiciel de traitement de texte", "Comme hyperviseur de type 1 en entreprise", "Comme navigateur web", "Comme systeme de sauvegarde cloud"], answer: "Comme hyperviseur de type 1 en entreprise" },
  { prompt: "Le NAS est plutot oriente :", options: ["Partage de fichiers", "Execution du VMkernel", "Creation de vCPU", "Initialisation des blocs disque"], answer: "Partage de fichiers" },
  { prompt: "Le SAN est plutot oriente :", options: ["Stockage bloc performant pour serveurs", "Usage exclusif d'un particulier a la maison", "Parametres BIOS", "Suspension de VM"], answer: "Stockage bloc performant pour serveurs" },
  { prompt: "Le fichier principal a utiliser pour enregistrer une VM dans l'inventaire est :", options: [".vmdk", ".flat.vmdk", ".vmx", ".vmss"], answer: ".vmx" },
  { prompt: "Une machine virtuelle apparait dans l'interface d'administration grace :", options: ["A son fichier .vmx charge dans l'inventaire", "Au snapshot", "Au FQDN du serveur Internet", "Au .nvram uniquement"], answer: "A son fichier .vmx charge dans l'inventaire" },
  { prompt: "Le datastore est :", options: ["Une memoire vive virtuelle", "Un espace de stockage logique", "Un processeur reseau", "Un snapshot temporaire"], answer: "Un espace de stockage logique" },
  { prompt: "Le snapshot n'est pas :", options: ["Un point de retour temporaire", "Une capture de l'etat d'une VM", "Une sauvegarde complete", "Un mecanisme utile avant un test"], answer: "Une sauvegarde complete" },
  { prompt: "Le BIOS ou l'UEFI d'une VM est stocke dans :", options: [".vmx", ".nvram", ".vmsd", ".vswp"], answer: ".nvram" },
  { prompt: "Le fichier qui contient reellement les donnees du disque virtuel est :", options: [".vmx", ".nvram", "-flat.vmdk", ".vmsn"], answer: "-flat.vmdk" },
  { prompt: "Une VM suspendue trop longtemps peut :", options: ["Etre desynchronisee du reste de l'infrastructure", "Augmenter automatiquement la taille du CPU physique", "Detruire le datastore", "Supprimer son invite"], answer: "Etre desynchronisee du reste de l'infrastructure" },
  { prompt: "Parmi ces propositions, laquelle est correcte ?", options: ["Le thin reserve tout l'espace immediatement", "Le thick est dynamique", "Le thin grandit selon l'usage", "Le thick ne prend jamais d'espace reel"], answer: "Le thin grandit selon l'usage" },
  { prompt: "NAS signifie :", options: ["Network Access System", "Network Attached Storage", "Name Attached Server", "New Attached Storage"], answer: "Network Attached Storage" },
  { prompt: "SAN signifie :", options: ["Storage Area Network", "Server Access Network", "System Area Node", "Storage Attached Network"], answer: "Storage Area Network" },
  { prompt: "FQDN signifie :", options: ["Full Quality Domain Name", "Fully Qualified Domain Name", "File Query Domain Network", "Fast Qualified Data Name"], answer: "Fully Qualified Domain Name" },
  { prompt: "VMkernel signifie :", options: ["le noyau principal de VMware ESXi qui gere les ressources physiques et virtuelles", "le disque principal d'une machine virtuelle", "le fichier de swap de VMware", "le nom reseau complet d'un serveur"], answer: "le noyau principal de VMware ESXi qui gere les ressources physiques et virtuelles" },
  { prompt: "VMDK signifie :", options: ["Virtual Machine Disk", "Virtual Memory Disk Kernel", "Virtual Managed Data Kit", "Volume Machine Disk Kernel"], answer: "Virtual Machine Disk" },
  { prompt: "VMX signifie :", options: ["Virtual Machine Extension", "Virtual Machine Execute", "Virtual Machine Configuration", "Virtual Memory Configuration"], answer: "Virtual Machine Configuration" },
  { prompt: "VSWP signifie :", options: ["Virtual System Write Page", "Virtual Machine Swap", "Virtual Storage Web Page", "Virtual Swap Protocol"], answer: "Virtual Machine Swap" },
  { prompt: "VMSS signifie :", options: ["Virtual Machine Suspend State", "Virtual Memory System Storage", "Virtual Machine System Snapshot", "Virtual Managed Suspend Server"], answer: "Virtual Machine Suspend State" },
  { prompt: "VMSN signifie :", options: ["Virtual Machine Snapshot Number", "Virtual Machine System Network", "Virtual Managed Storage Name", "Virtual Memory Snapshot Node"], answer: "Virtual Machine Snapshot Number" },
  { prompt: "VMSD signifie :", options: ["Virtual Machine Snapshot Descriptor", "Virtual Machine Storage Disk", "Virtual Managed System Data", "Virtual Machine System Driver"], answer: "Virtual Machine Snapshot Descriptor" },
  { prompt: "NVRAM signifie :", options: ["Network Virtual RAM", "Non-Volatile Random Access Memory", "New Virtual Random Access Mode", "Non-Verified RAM"], answer: "Non-Volatile Random Access Memory" },
  { prompt: "CPU signifie :", options: ["Central Process Unit", "Central Processing Unit", "Computer Processing Utility", "Core Process Usage"], answer: "Central Processing Unit" },
  { prompt: "RAM signifie :", options: ["Random Access Memory", "Rapid Access Mode", "Read Access Memory", "Random Active Module"], answer: "Random Access Memory" },
  { prompt: "Une machine virtuelle est :", options: ["obligatoirement un fichier unique", "un ensemble de fichiers representant un ordinateur logique", "uniquement un disque virtuel", "uniquement un systeme d'exploitation"], answer: "un ensemble de fichiers representant un ordinateur logique" },
  { prompt: "Le fichier .vmx contient :", options: ["uniquement les donnees utilisateur", "la configuration principale de la machine virtuelle", "le contenu complet du disque", "le nom du datastore uniquement"], answer: "la configuration principale de la machine virtuelle" },
  { prompt: "Le fichier -flat.vmdk :", options: ["contient les donnees reelles du disque virtuel", "correspond au BIOS de la VM", "sert a suspendre la VM", "est le fichier principal de configuration"], answer: "contient les donnees reelles du disque virtuel" },
  { prompt: "Le snapshot :", options: ["remplace une sauvegarde complete", "permet un retour arriere temporaire", "est obligatoire pour demarrer une VM", "supprime automatiquement le disque principal"], answer: "permet un retour arriere temporaire" },
  { prompt: "Un disque thin :", options: ["reserve immediatement tout l'espace prevu", "consomme uniquement l'espace reellement utilise", "est toujours plus sur qu'un thick", "n'utilise jamais de datastore"], answer: "consomme uniquement l'espace reellement utilise" },
  { prompt: "Le datastore :", options: ["est un espace de stockage logique", "est un type de processeur", "correspond toujours a un NAS uniquement", "est le systeme invite"], answer: "est un espace de stockage logique" },
  { prompt: "L'inventaire VMware contient :", options: ["les VM connues et administrables par l'hyperviseur", "uniquement les disques .vmdk", "les mots de passe du BIOS", "seulement les snapshots"], answer: "les VM connues et administrables par l'hyperviseur" },
  { prompt: "Le fichier .vmss est utilise lorsque la VM est :", options: ["supprimee", "suspendue", "consolidee", "migree"], answer: "suspendue" },
  { prompt: "Le VMkernel est :", options: ["un disque virtuel", "le noyau de VMware ESXi", "un snapshot", "un protocole reseau"], answer: "le noyau de VMware ESXi" },
  { prompt: "Un hyperviseur de type 2 est surtout utilise pour :", options: ["les tests et la formation", "la production lourde en priorite", "remplacer un SAN", "faire office de carte reseau"], answer: "les tests et la formation" },
  { prompt: "Le role principal de l'hyperviseur est de :", options: ["connecter automatiquement Internet", "gerer les machines virtuelles et les ressources materielles", "remplacer la RAM physique", "chiffrer tous les fichiers"], answer: "gerer les machines virtuelles et les ressources materielles" },
  { prompt: "Quand on dit qu'une VM est chargee dans l'inventaire, cela signifie :", options: ["qu'elle a ete supprimee du datastore", "que son fichier de configuration a ete ajoute a la gestion de l'hyperviseur", "que son processeur a ete double", "qu'elle a ete transformee en snapshot"], answer: "que son fichier de configuration a ete ajoute a la gestion de l'hyperviseur" },
  { prompt: "Quel fichier faut-il utiliser pour enregistrer une VM presente dans un datastore dans l'interface VMware ?", options: [".vmdk", ".vmx", ".vmss", ".nvram"], answer: ".vmx" },
  { prompt: "Le fichier .nvram stocke :", options: ["les parametres BIOS/UEFI de la machine virtuelle", "les donnees utilisateur", "le fichier delta du snapshot", "la memoire vive physique"], answer: "les parametres BIOS/UEFI de la machine virtuelle" },
  { prompt: "La consolidation consiste a :", options: ["fusionner les modifications du snapshot avec le disque principal", "supprimer la RAM de la VM", "convertir un NAS en SAN", "suspendre une VM"], answer: "fusionner les modifications du snapshot avec le disque principal" },
  { prompt: "Un snapshot trop ancien peut poser probleme car :", options: ["il prend de l'espace et peut ralentir les performances", "il ameliore toujours les performances", "il remplace le .vmx", "il desactive l'inventaire"], answer: "il prend de l'espace et peut ralentir les performances" },
  { prompt: "Le swap VMware est gere par :", options: ["le fichier .vmsn", "le fichier .vswp", "le fichier .vmx", "le fichier .vmdk uniquement"], answer: "le fichier .vswp" },
  { prompt: "Dans un cluster, plusieurs hotes sont regroupes afin de :", options: ["mutualiser les ressources", "diminuer les possibilites de migration", "empecher toute haute disponibilite", "supprimer les VM automatiquement"], answer: "mutualiser les ressources" },
  { prompt: "Le SAN se distingue surtout du NAS car :", options: ["le SAN fournit un acces de type bloc vu comme local par les serveurs", "le SAN sert uniquement au partage de fichiers utilisateurs", "le SAN est un fichier VMware", "le SAN remplace l'hyperviseur"], answer: "le SAN fournit un acces de type bloc vu comme local par les serveurs" },
  { prompt: "Quelles ressources sont virtualisees ?", options: ["CPU", "RAM", "Stockage", "Reseau"], answers: ["CPU", "RAM", "Stockage", "Reseau"] },
  { prompt: "Quels elements peuvent se trouver dans un datastore ?", options: ["fichiers de VM", "snapshots", "fichiers de swap", "fichiers de configuration"], answers: ["fichiers de VM", "snapshots", "fichiers de swap", "fichiers de configuration"] },
  { prompt: "Quels sont des hyperviseurs de type 1 ?", options: ["VMware ESXi", "Hyper-V Server", "Proxmox VE", "VirtualBox"], answers: ["VMware ESXi", "Hyper-V Server", "Proxmox VE"] },
  { prompt: "Quels fichiers peuvent appartenir a une machine virtuelle VMware ?", options: [".vmx", ".vmdk", ".nvram", ".vswp"], answers: [".vmx", ".vmdk", ".nvram", ".vswp"] },
  { prompt: "Quelles affirmations sur le disque thick sont vraies ?", options: ["l'espace est reserve des la creation", "c'est un disque statique", "il economise toujours plus d'espace que le thin", "il reduit le risque de saturation imprevue"], answers: ["l'espace est reserve des la creation", "c'est un disque statique", "il reduit le risque de saturation imprevue"] },
  { prompt: "Quelles affirmations sur le disque thin sont vraies ?", options: ["l'espace est alloue selon l'usage", "il grandit au fur et a mesure", "il reserve immediatement toute la capacite", "il peut provoquer une saturation du datastore si on ne surveille pas"], answers: ["l'espace est alloue selon l'usage", "il grandit au fur et a mesure", "il peut provoquer une saturation du datastore si on ne surveille pas"] },
  { prompt: "Quelles affirmations sur le snapshot sont vraies ?", options: ["c'est une capture a un instant T", "ce n'est pas une sauvegarde complete", "il permet un retour arriere", "il doit idealement rester temporaire"], answers: ["c'est une capture a un instant T", "ce n'est pas une sauvegarde complete", "il permet un retour arriere", "il doit idealement rester temporaire"] },
  { prompt: "Quelles affirmations sur le fichier .vswp sont vraies ?", options: ["il correspond au swap VMware", "il est cree au demarrage de la VM", "il est supprime a l'arret de la VM", "il contient le BIOS de la VM"], answers: ["il correspond au swap VMware", "il est cree au demarrage de la VM", "il est supprime a l'arret de la VM"] },
  { prompt: "Quelles affirmations sur le cluster sont vraies ?", options: ["il regroupe plusieurs hotes", "il permet la repartition des charges", "il ameliore la disponibilite", "il interdit les migrations"], answers: ["il regroupe plusieurs hotes", "il permet la repartition des charges", "il ameliore la disponibilite"] },
  { prompt: "Quelles affirmations sur le VMkernel sont vraies ?", options: ["il gere CPU, RAM, stockage et reseau", "il fait le lien entre physique et virtuel", "c'est le noyau d'ESXi", "c'est le fichier principal d'un snapshot"], answers: ["il gere CPU, RAM, stockage et reseau", "il fait le lien entre physique et virtuel", "c'est le noyau d'ESXi"] },
  { prompt: "La virtualisation permet a un seul serveur physique d'heberger plusieurs machines virtuelles.", options: ["Vrai", "Faux"], answer: "Vrai" },
  { prompt: "Un hyperviseur de type 1 s'installe sur un systeme Windows deja installe.", options: ["Vrai", "Faux"], answer: "Faux" },
  { prompt: "Le NAS est surtout utilise pour le partage de fichiers sur un reseau.", options: ["Vrai", "Faux"], answer: "Vrai" },
  { prompt: "Le SAN permet aux serveurs d'acceder a du stockage comme s'il etait local.", options: ["Vrai", "Faux"], answer: "Vrai" },
  { prompt: "Le fichier .vmx contient les donnees reelles du disque virtuel.", options: ["Vrai", "Faux"], answer: "Faux" },
  { prompt: "Le fichier -flat.vmdk contient les donnees reelles du disque virtuel.", options: ["Vrai", "Faux"], answer: "Vrai" },
  { prompt: "Le fichier .nvram contient les parametres BIOS/UEFI de la VM.", options: ["Vrai", "Faux"], answer: "Vrai" },
  { prompt: "Le snapshot est une sauvegarde complete de la machine virtuelle.", options: ["Vrai", "Faux"], answer: "Faux" },
  { prompt: "La consolidation permet de fusionner les donnees modifiees d'un snapshot avec le disque principal.", options: ["Vrai", "Faux"], answer: "Vrai" },
  { prompt: "Le thin provisioning reserve tout l'espace du disque des la creation.", options: ["Vrai", "Faux"], answer: "Faux" },
  { prompt: "Le thick provisioning reserve l'espace disque des la creation.", options: ["Vrai", "Faux"], answer: "Vrai" },
  { prompt: "Le fichier .vmss est lie a l'etat suspendu d'une machine virtuelle.", options: ["Vrai", "Faux"], answer: "Vrai" },
  { prompt: "Le fichier .vswp existe uniquement quand la VM est allumee.", options: ["Vrai", "Faux"], answer: "Vrai" },
  { prompt: "Quelle difference est correcte entre SAN et NAS ?", options: ["le SAN est un reseau de stockage, le NAS est un appareil ou serveur de stockage connecte au reseau", "le SAN est un fichier VMware, le NAS est un hyperviseur", "le SAN sert aux snapshots, le NAS au swap", "aucune difference"], answer: "le SAN est un reseau de stockage, le NAS est un appareil ou serveur de stockage connecte au reseau" },
  { prompt: "Quelle difference est correcte entre type 1 et type 2 ?", options: ["le type 1 s'installe sur le materiel, le type 2 sur un systeme d'exploitation", "le type 1 est pour Linux uniquement, le type 2 pour Windows uniquement", "le type 1 est un snapshot, le type 2 un datastore", "aucune difference"], answer: "le type 1 s'installe sur le materiel, le type 2 sur un systeme d'exploitation" },
  { prompt: "Quelle difference est correcte entre thick et thin ?", options: ["thick reserve l'espace immediatement, thin l'alloue selon l'usage", "thick est dynamique, thin est statique", "thin reserve toujours plus d'espace que thick", "thick et thin sont identiques"], answer: "thick reserve l'espace immediatement, thin l'alloue selon l'usage" },
  { prompt: "Quelle difference est correcte entre Thick Eager Zeroed et Thick Lazy Zeroed ?", options: ["en eager, les blocs sont initialises des la creation ; en lazy, lors du premier usage", "en lazy, tout est initialise immediatement ; en eager, jamais", "eager est un disque thin", "aucune difference"], answer: "en eager, les blocs sont initialises des la creation ; en lazy, lors du premier usage" },
  { prompt: "Quelle difference est correcte entre snapshot et sauvegarde ?", options: ["le snapshot est un point de retour temporaire, la sauvegarde est une copie destinee a etre conservee", "les deux sont exactement identiques", "la sauvegarde sert seulement a suspendre une VM", "le snapshot remplace toujours la sauvegarde"], answer: "le snapshot est un point de retour temporaire, la sauvegarde est une copie destinee a etre conservee" },
  { prompt: "Quelle difference est correcte entre hote et invite ?", options: ["l'hote heberge, l'invite est le systeme installe dans la VM", "l'hote est un fichier, l'invite est un disque", "l'hote est toujours Windows", "l'invite est toujours Linux"], answer: "l'hote heberge, l'invite est le systeme installe dans la VM" },
  { prompt: "Tu crees un disque de 100 Go en thin. La VM contient seulement 18 Go de donnees. Que peut-on dire ?", options: ["le datastore est forcement occupe par 100 Go", "le disque n'occupera qu'environ l'espace reellement utilise", "le disque ne peut pas fonctionner", "le fichier .vmx est supprime"], answer: "le disque n'occupera qu'environ l'espace reellement utilise" },
  { prompt: "Tu veux creer un disque entierement reserve et initialise immediatement. Quel type choisis-tu ?", options: ["Thin", "Thick Lazy Zeroed", "Thick Eager Zeroed", "Snapshot"], answer: "Thick Eager Zeroed" },
  { prompt: "Une VM apparait dans le datastore mais pas dans l'interface VMware. Quelle action est la plus logique ?", options: ["charger le fichier .vmx dans l'inventaire", "supprimer le datastore", "convertir le SAN en NAS", "effacer le .nvram"], answer: "charger le fichier .vmx dans l'inventaire" },
  { prompt: "Une VM a un snapshot ancien qui prend beaucoup de place. Quelle operation est la plus adaptee ?", options: ["consolidation / suppression correcte du snapshot", "augmenter le FQDN", "supprimer le VMkernel", "convertir la VM en hyperviseur"], answer: "consolidation / suppression correcte du snapshot" },
  { prompt: "Une VM ne peut plus fonctionner correctement car le datastore est plein. Quelle cause est plausible ?", options: ["fichier snapshot/delta trop volumineux", "manque d'espace pour les fichiers necessaires comme le swap", "accumulation de fichiers de VM", "toutes les reponses ci-dessus"], answer: "toutes les reponses ci-dessus" },
  { prompt: "Tu veux un environnement de test sur ton PC personnel Windows. Quelle solution est la plus adaptee ?", options: ["VMware Workstation ou VirtualBox", "ESXi en priorite absolue sur ton poste perso sans besoin particulier", "un SAN uniquement", "un fichier .vmss"], answer: "VMware Workstation ou VirtualBox" },
  { prompt: "Tu veux de la haute disponibilite et la possibilite de deplacer des VM entre plusieurs hotes. Quelle notion est la plus concernee ?", options: ["cluster", ".nvram", "BIOS", "thin provisioning uniquement"], answer: "cluster" },
  { prompt: "Une VM est suspendue. Quel fichier peut stocker son etat ?", options: [".vmss", ".vmdk", ".nvram", ".vmsd"], answer: ".vmss" },
  { prompt: "Apres creation d'un snapshot, ou vont les nouvelles modifications ?", options: ["directement dans le disque principal uniquement", "dans un fichier delta lie au snapshot", "dans le BIOS", "dans le FQDN"], answer: "dans un fichier delta lie au snapshot" },
  { prompt: "Tu veux partager simplement des fichiers entre plusieurs utilisateurs sur le reseau. Quel choix correspond le mieux ?", options: ["NAS", "SAN", "VMkernel", "Thick Eager Zeroed"], answer: "NAS" },
  { prompt: "Tu veux fournir a des serveurs un stockage performant vu comme local. Quel choix correspond le mieux ?", options: ["NAS", "SAN", ".vmx", ".vmss"], answer: "SAN" }
];
const EXPLANATIONS_BY_PROMPT = window.EXPLANATIONS_BY_PROMPT || {};
QUESTION_BANK.forEach((question) => {
  question.explanation = question.explanation ?? EXPLANATIONS_BY_PROMPT[question.prompt] ?? null;
});

const QUIZ_SIZE = 10;
const LETTERS = ["A", "B", "C", "D"];

const screens = {
  start: document.getElementById("start-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen"),
  review: document.getElementById("review-screen"),
};

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const retryBtn = document.getElementById("retry-btn");
const errorsBtn = document.getElementById("errors-btn");
const reviewRetryBtn = document.getElementById("review-retry-btn");
const reviewBackBtn = document.getElementById("review-back-btn");

const progressText = document.getElementById("progress-text");
const scoreHint = document.getElementById("score-hint");
const questionText = document.getElementById("question-text");
const answersForm = document.getElementById("answers-form");
const resultTitle = document.getElementById("result-title");
const resultSummary = document.getElementById("result-summary");
const resultExplanationsSummary = document.getElementById("result-explanations-summary");
const resultExplanationsList = document.getElementById("result-explanations-list");
const reviewList = document.getElementById("review-list");

let currentQuiz = [];
let currentIndex = 0;
let userResults = [];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isMultiple(question) {
  return Array.isArray(question.answers);
}

function pickQuestions() {
  return shuffle(QUESTION_BANK).slice(0, QUIZ_SIZE).map((question) => ({
    ...question,
    shuffledOptions: shuffle(question.options),
  }));
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function updateNextButtonState() {
  const inputs = Array.from(answersForm.querySelectorAll('input[name="answer"]'));
  nextBtn.disabled = !inputs.some((input) => input.checked);
}

function startQuiz() {
  currentQuiz = pickQuestions();
  currentIndex = 0;
  userResults = [];
  renderQuestion();
  showScreen("quiz");
}

function renderQuestion() {
  const question = currentQuiz[currentIndex];
  const multiple = isMultiple(question);
  progressText.textContent = `Question ${currentIndex + 1} / ${QUIZ_SIZE}`;
  scoreHint.textContent = multiple ? "Plusieurs reponses possibles" : "1 point par question";
  questionText.textContent = question.prompt;
  nextBtn.disabled = true;
  answersForm.innerHTML = "";

  question.shuffledOptions.forEach((option, index) => {
    const id = `answer-${currentIndex}-${index}`;
    const wrapper = document.createElement("label");
    wrapper.className = "answer-option";
    wrapper.htmlFor = id;

    const input = document.createElement("input");
    input.type = multiple ? "checkbox" : "radio";
    input.name = "answer";
    input.id = id;
    input.value = option;
    input.addEventListener("change", updateNextButtonState);

    const letter = document.createElement("span");
    letter.className = "answer-label";
    letter.textContent = LETTERS[index] || `${index + 1}`;

    const text = document.createElement("span");
    text.textContent = option;

    wrapper.appendChild(input);
    wrapper.appendChild(letter);
    wrapper.appendChild(text);
    answersForm.appendChild(wrapper);
  });
}

function normalizeList(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function formatAnswer(answer) {
  if (Array.isArray(answer)) {
    return answer.join(", ");
  }
  return answer;
}

function roundScore(value) {
  return Math.round(value * 100) / 100;
}

function formatPoints(value) {
  if (Number.isInteger(value)) {
    return `${value}`;
  }
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function calculateQuestionScore(correctAnswer, userAnswer) {
  if (!Array.isArray(correctAnswer)) {
    return userAnswer === correctAnswer ? 1 : 0;
  }

  const correctSet = new Set(correctAnswer);
  const userSet = new Set(userAnswer);
  let correctSelected = 0;
  let incorrectSelected = 0;

  userSet.forEach((answer) => {
    if (correctSet.has(answer)) {
      correctSelected += 1;
    } else {
      incorrectSelected += 1;
    }
  });

  return Math.max(0, roundScore((correctSelected - incorrectSelected) / correctAnswer.length));
}

function storeAnswer() {
  const selected = Array.from(answersForm.querySelectorAll('input[name="answer"]:checked')).map((input) => input.value);
  if (selected.length === 0) {
    return false;
  }

  const question = currentQuiz[currentIndex];
  const correctAnswer = isMultiple(question) ? normalizeList(question.answers) : question.answer;
  const userAnswer = isMultiple(question) ? normalizeList(selected) : selected[0];
  const pointsEarned = calculateQuestionScore(correctAnswer, userAnswer);
  const isCorrect = pointsEarned === 1;

  userResults.push({
    prompt: question.prompt,
    userAnswer,
    correctAnswer,
    isCorrect,
    pointsEarned,
    explanation: question.explanation,
  });

  return true;
}

function nextQuestion() {
  if (!storeAnswer()) {
    return;
  }

  currentIndex += 1;
  if (currentIndex < currentQuiz.length) {
    renderQuestion();
    return;
  }

  renderResults();
  showScreen("result");
}

function renderResults() {
  const score = roundScore(userResults.reduce((total, result) => total + result.pointsEarned, 0));
  resultTitle.textContent = `Ta note : ${formatPoints(score)} / ${QUIZ_SIZE}`;
  resultSummary.textContent = score === QUIZ_SIZE
    ? "Sans faute. Tu peux relancer pour avoir un nouveau tirage aleatoire."
    : "Tu peux voir tes erreurs en detail, puis relancer un nouveau QCM quand tu veux.";


  renderResultExplanations();
}

function createCorrectionItem(result, indexLabel) {
  const item = document.createElement("article");
  const stateClass = result.isCorrect ? "good" : result.pointsEarned > 0 ? "partial" : "bad";
  item.className = `review-item ${result.isCorrect ? "good" : result.pointsEarned > 0 ? "partial" : "bad"}`;

  const title = document.createElement("h3");
  title.textContent = `${indexLabel}. ${result.prompt}`;

  const score = document.createElement("p");
  score.className = "review-score";
  if (result.isCorrect) {
    score.textContent = "1 point : bonne reponse";
  } else if (result.pointsEarned > 0) {
    score.textContent = `${formatPoints(result.pointsEarned)} point sur 1 : reponse partiellement correcte`;
  } else {
    score.textContent = "0 point : mauvaise reponse";
  }

  const chosen = document.createElement("p");
  chosen.textContent = `Ta reponse : ${formatAnswer(result.userAnswer)}`;

  const correct = document.createElement("p");
  correct.textContent = `Bonne reponse : ${formatAnswer(result.correctAnswer)}`;

  item.appendChild(title);
  item.appendChild(score);
  item.appendChild(chosen);
  item.appendChild(correct);

  if (result.explanation) {
    const explanation = document.createElement("p");
    explanation.className = "review-explanation";
    explanation.textContent = `Explication de cours : ${result.explanation}`;
    item.appendChild(explanation);
  }

  return item;
}

function renderResultExplanations() {
  resultExplanationsList.innerHTML = "";

  const explainedMistakes = userResults.filter((result) => !result.isCorrect && result.explanation);
  const explainedCorrect = userResults.filter((result) => result.isCorrect && result.explanation);
  const itemsToShow = explainedMistakes.length > 0 ? explainedMistakes : explainedCorrect.slice(0, 3);

  if (explainedMistakes.length > 0) {
    resultExplanationsSummary.textContent = "Voici les notions a revoir en priorite sur les questions ratees de cette session.";
  } else if (itemsToShow.length > 0) {
    resultExplanationsSummary.textContent = "Aucune erreur avec explication sur cette session. Voici quelques rappels de cours utiles sur les notions importantes du tirage.";
  } else {
    resultExplanationsSummary.textContent = "Aucune explication de cours n'est disponible pour les questions de cette session.";
  }

  itemsToShow.forEach((result, index) => {
    resultExplanationsList.appendChild(createCorrectionItem(result, index + 1));
  });
}

function renderReview() {
  reviewList.innerHTML = "";

  userResults.forEach((result, index) => {
    reviewList.appendChild(createCorrectionItem(result, index + 1));
  });
}

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
retryBtn.addEventListener("click", startQuiz);
reviewRetryBtn.addEventListener("click", startQuiz);
errorsBtn.addEventListener("click", () => {
  renderReview();
  showScreen("review");
});
reviewBackBtn.addEventListener("click", () => showScreen("result"));













