#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

// Liste des pages à vérifier et corriger
const pagesToFix = [
  'app/page.tsx',
  'app/connexion/page.tsx',
  'app/mot-de-passe-oublie/page.tsx',
  'app/inscription/confirmation/page.tsx',
  'app/onboarding/page.tsx',
  'app/test-dev-auth/page.tsx',
  'app/sigrid-larsen/page.tsx',
  'app/test-auth/page.tsx',
  'app/test-stripe/page.tsx',
  'app/charte/page.tsx',
  'app/confirmation-attente/page.tsx',
  'app/auth/confirmer/page.tsx',
  'app/auth/confirm/page.tsx',
  'app/cours/guide-demarrage/page.tsx',
  'app/programme/page.tsx',
  'app/(lms)/chat/page.tsx',
  'app/(lms)/cours/page.tsx',
  'app/(lms)/dashboard/page.tsx',
  'app/(lms)/membres/page.tsx',
];

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fixViewportInFile(filePath: string) {
  try {
    // Vérifier si le fichier existe
    if (!await fileExists(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return;
    }

    // Lire le contenu du fichier
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Vérifier si le fichier contient déjà un export viewport
    if (content.includes('export const viewport')) {
      console.log(`✅ ${filePath} - viewport déjà migré`);
      return;
    }

    // Chercher metadata avec viewport
    const metadataRegex = /export\s+const\s+metadata[^=]*=\s*({[\s\S]*?})\s*(?=\n(?:export|function|const|let|var|class|interface|type|$))/;
    const match = content.match(metadataRegex);
    
    if (!match) {
      console.log(`ℹ️  ${filePath} - pas de metadata trouvée`);
      return;
    }

    const metadataContent = match[1];
    
    // Vérifier si viewport est dans metadata
    if (!metadataContent.includes('viewport')) {
      console.log(`ℹ️  ${filePath} - pas de viewport dans metadata`);
      return;
    }

    // Extraire le viewport de metadata
    const viewportMatch = metadataContent.match(/viewport\s*:\s*['"`]([^'"`]+)['"`]/);
    
    if (!viewportMatch) {
      console.log(`⚠️  ${filePath} - format viewport non reconnu`);
      return;
    }

    const viewportValue = viewportMatch[1];
    
    // Créer le nouvel export viewport
    const viewportExport = `
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}`;

    // Retirer viewport de metadata
    const newMetadataContent = metadataContent.replace(/,?\s*viewport\s*:\s*['"`][^'"`]+['"`],?/g, '');
    
    // Remplacer l'ancienne metadata
    content = content.replace(metadataContent, newMetadataContent);
    
    // Ajouter le nouvel export viewport après metadata
    const metadataEndIndex = content.indexOf(match[0]) + match[0].length;
    content = content.slice(0, metadataEndIndex) + viewportExport + content.slice(metadataEndIndex);
    
    // Écrire le fichier modifié
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✨ ${filePath} - viewport migré avec succès`);
    
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error);
  }
}

async function main() {
  console.log('🔧 Correction des metadata viewport...\n');
  
  for (const page of pagesToFix) {
    await fixViewportInFile(page);
  }
  
  console.log('\n✅ Correction terminée!');
}

main().catch(console.error);
