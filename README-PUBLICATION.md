# Publication partagée du QCM

Le site peut fonctionner de 2 façons :

1. Mode local
- aucun service externe
- les ajouts restent sur le navigateur actuel uniquement

2. Mode partage public
- utilise Supabase comme base commune
- toute question ajoutee devient visible sur tous les appareils

## Fichiers a remplir

Ouvre [app-config.js](D:\CODE\app-config.js) et remplace :
- `supabaseUrl`
- `supabaseAnonKey`

Laisse `storageMode: "auto"`.
Quand les deux valeurs sont presentes, le site passe automatiquement en mode partage public.

## Tables Supabase a creer

### categories
```sql
create table public.categories (
  id text primary key,
  name text not null
);
```

### questions
```sql
create table public.questions (
  id text primary key,
  category_id text not null references public.categories(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  answers jsonb not null,
  explanation text null
);
```

## Regles simples pour un site public complet

Si tu veux que tout le monde puisse lire et ajouter :
- active la lecture publique sur `categories` et `questions`
- active l'insertion publique sur `categories` et `questions`

Si tu ne veux pas que tout le monde puisse supprimer :
- laisse `allowPublicDelete: false` dans `app-config.js`
- n'active pas la suppression publique dans Supabase

## Publication GitHub Pages

Publie ensuite ces fichiers sur GitHub Pages :
- `index.html`
- `styles.css`
- `script.js`
- `questions-data.js`
- `app-config.js`
- `.nojekyll`

## Resultat

Une fois Supabase configure :
- tu ajoutes une categorie ou une question depuis n'importe quel appareil
- elle est enregistree dans la base commune
- tout le monde la voit automatiquement sur le site
