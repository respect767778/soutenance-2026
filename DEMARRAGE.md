# 🚀 Guide de Démarrage Rapide du Serveur

Ce fichier liste les commandes successives à exécuter pour lancer le serveur de développement sans encombre.

---

## 📋 Commandes à exécuter à chaque fois (Workflow Quotidien)

### 1️⃣ Récupérer les dernières mises à jour (Obligatoire)
Dans votre terminal PowerShell / CMD à la racine du projet :
```powershell
git pull
```

---

### 2️⃣ Installer / Mettre à jour les dépendances (si nouveau code ou nouvelles librairies)
```powershell
npm install
```

---

### 3️⃣ Démarrer le serveur de développement
```powershell
npm run dev
```

---

### 4️⃣ Ouvrir l'application
Le serveur démarre sur :
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Accès directs par rôle

| Espace | URL de connexion |
| :--- | :--- |
| 🛡️ **Administrateur** | [http://localhost:3000/connexion/admin](http://localhost:3000/connexion/admin) |
| ✍️ **Éditeur** | [http://localhost:3000/connexion/editeur](http://localhost:3000/connexion/editeur) |
| 🖋️ **Auteur (Créateur)** | [http://localhost:3000/connexion/auteur](http://localhost:3000/connexion/auteur) |
| 📚 **Client** | [http://localhost:3000/connexion/client](http://localhost:3000/connexion/client) |

---

## 🛠️ En cas de problème / Dépannage

### ❌ Le port 3000 est déjà occupé
Si un ancien serveur tourne encore en arrière-plan :
```powershell
# Trouver et arrêter le processus sur le port 3000 (PowerShell)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

### ❌ Erreur de cache Next.js (écran blanc ou bugs étranges)
Supprimez le cache de compilation et relancez :
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### ❌ Problème de connexion à la base de données
Vérifiez que le fichier `.env.local` est bien présent à la racine avec vos clés Supabase valides :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

---

## 📤 Après avoir fini de travailler (Règle du projet)
N'oubliez pas d'enregistrer et envoyer vos modifications sur **les deux branches** (branche de travail + branche `main` pour Vercel) :
```powershell
git add .
git commit -m "Description de vos modifications"
git push
git push origin HEAD:main
```

