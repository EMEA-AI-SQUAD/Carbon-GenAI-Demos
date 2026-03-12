// IT Ops Email Scenarios for Entity Extraction Demo

export const IT_OPS_SCENARIOS = {
  italian_emotional: {
    title: "Emotional Italian Report Issue",
    description: "Demonstrates handling emotional language and priority assessment",
    language: "Italian",
    email: `Oggetto: URGENTE!!! Il sistema di report non funziona - AIUTO!!!

Caro Team IT,

Sono DISPERATO!!! Il sistema di report è completamente rotto e non riesco a generare il report mensile per il Vice Presidente! La riunione è domani mattina alle 9:00 e io non ho NIENTE da presentare!

Ho provato tutto - ho riavviato il computer tre volte, ho cancellato la cache, ho pregato... NIENTE FUNZIONA! Il sistema mi dà sempre lo stesso errore: "Errore di connessione al database - timeout dopo 30 secondi".

Questo è un DISASTRO! Il VP mi ha chiesto questo report la settimana scorsa e io gli ho promesso che sarebbe stato pronto. Se non riesco a consegnarlo, potrei perdere il mio lavoro! Ho una famiglia da mantenere, un mutuo da pagare... non posso permettermi di perdere questo lavoro!

Per favore, per favore, PER FAVORE aiutatemi SUBITO! Sono disposto a restare in ufficio tutta la notte se necessario. Questo è il problema più importante della mia vita professionale!

Il report che devo generare è solo un riepilogo delle vendite del mese scorso - niente di troppo complicato, ma il VP lo vuole assolutamente per la riunione di domani.

AIUTATEMI!!!

Cordiali saluti (ma molto stressati),
Marco Rossi
Analista Vendite
Tel: +39 02 1234 5678
Email: marco.rossi@company.it

P.S. - HO DAVVERO BISOGNO DI AIUTO URGENTE!!!`,
    entities: [
      {
        label: "English Summary",
        definition: "A concise summary of the email content in English (2-3 sentences covering the main issue, impact, and request)"
      },
      {
        label: "Sender Name",
        definition: "Who sent this email (full name)"
      },
      {
        label: "Sender Role",
        definition: "The job title or role of the sender"
      },
      {
        label: "Business Area",
        definition: "Which business department or function is affected (e.g., Sales, Logistics, Finance)"
      },
      {
        label: "Issue Type",
        definition: "The technical problem being reported"
      },
      {
        label: "Affected System",
        definition: "Which system or application is having problems"
      },
      {
        label: "Error Message",
        definition: "Any specific error messages mentioned"
      },
      {
        label: "Time First Encountered",
        definition: "When did the problem first occur or was first noticed"
      },
      {
        label: "Deadline",
        definition: "When does this need to be resolved"
      },
      {
        label: "Business Impact",
        definition: "The actual impact on business operations (what can't be done)"
      },
      {
        label: "Emotional State",
        definition: "The emotional tone of the sender (calm/stressed/panicked)"
      },
      {
        label: "True Priority",
        definition: "Objective assessment of priority: Low (no immediate business impact), Medium (business inconvenience), High (business disruption), Critical (safety/major financial risk)"
      },
      {
        label: "Suggested Solution Area",
        definition: "Based on the error and symptoms, what technical area should be investigated first (e.g., database connectivity, network, application server, user permissions)"
      }
    ]
  },
  
  french_professional: {
    title: "Professional French Safety Critical Issue",
    description: "Demonstrates handling professional language and critical safety assessment",
    language: "French",
    email: `Objet: Incident Critique - Système Logistique Entrepôt B - Risque Sécurité

Bonjour l'équipe IT,

Je vous contacte concernant un incident technique critique affectant le système de gestion logistique de l'entrepôt B.

DÉTAILS TECHNIQUES:
- Système affecté: Module de contrôle climatique et inventaire (WMS-Climate-Control v3.2)
- Erreur: Défaillance du système de surveillance de température
- Code d'erreur: TEMP_SENSOR_FAIL_0x4A7B
- Heure de détection: 14:30 CET aujourd'hui

IMPACT OPÉRATIONNEL:
Le système ne peut plus surveiller ni réguler la température dans la zone de stockage C, qui contient actuellement 2,400 unités de déodorants en aérosol (produits sous pression). Sans contrôle de température, ces produits présentent un risque d'explosion si la température dépasse 45°C.

La température ambiante actuelle est de 28°C et augmente de 2°C par heure en raison de l'ensoleillement direct sur cette section du bâtiment.

RISQUES IDENTIFIÉS:
1. Risque de sécurité: Explosion potentielle des aérosols sous pression
2. Risque opérationnel: Impossibilité d'expédier 15 commandes clients (valeur: €47,000)
3. Risque réglementaire: Non-conformité avec les normes de stockage de produits dangereux (ADR)

ACTIONS DÉJÀ ENTREPRISES:
- Notification du responsable sécurité (M. Dubois)
- Activation du protocole d'urgence pour produits dangereux
- Ventilation manuelle de la zone activée
- Équipe de sécurité en alerte

DEMANDE:
Intervention technique urgente requise dans les 2 heures pour:
1. Restaurer le système de surveillance de température
2. Vérifier l'intégrité des données d'inventaire
3. Valider le système de contrôle climatique

Cette situation nécessite une résolution immédiate pour éviter un incident de sécurité majeur et permettre la reprise des expéditions.

Je reste disponible pour toute information complémentaire.

Cordialement,
Sophie Lefebvre, Ing.
Responsable Logistique - Entrepôt B
Tél: +33 1 45 67 89 00
Email: sophie.lefebvre@company.fr

Classification: URGENT - SÉCURITÉ`,
    entities: [
      {
        label: "English Summary",
        definition: "A concise summary of the email content in English (2-3 sentences covering the main issue, impact, and request)"
      },
      {
        label: "Sender Name",
        definition: "Who sent this email (full name)"
      },
      {
        label: "Sender Role",
        definition: "The job title or role of the sender"
      },
      {
        label: "Business Area",
        definition: "Which business department or function is affected (e.g., Sales, Logistics, Finance)"
      },
      {
        label: "Issue Type",
        definition: "The technical problem being reported"
      },
      {
        label: "Affected System",
        definition: "Which system or application is having problems"
      },
      {
        label: "Error Code",
        definition: "Any specific error codes mentioned"
      },
      {
        label: "Time First Encountered",
        definition: "When did the problem first occur or was first noticed"
      },
      {
        label: "Response Deadline",
        definition: "Required response time"
      },
      {
        label: "Business Impact",
        definition: "The actual impact on business operations (what can't be done)"
      },
      {
        label: "Safety Risk",
        definition: "Any safety or health risks mentioned (explosion, fire, injury, etc.)"
      },
      {
        label: "Financial Impact",
        definition: "Monetary value of affected operations or potential losses"
      },
      {
        label: "True Priority",
        definition: "Objective assessment of priority: Low (no immediate business impact), Medium (business inconvenience), High (business disruption), Critical (safety/major financial risk)"
      },
      {
        label: "Suggested Solution Area",
        definition: "Based on the error and symptoms, what technical area should be investigated first (e.g., sensor hardware, climate control system, database, network)"
      }
    ]
  }
};

export const getScenario = (scenarioKey) => {
  return IT_OPS_SCENARIOS[scenarioKey] || IT_OPS_SCENARIOS.italian_emotional;
};

export const getAllScenarios = () => {
  return Object.keys(IT_OPS_SCENARIOS).map(key => ({
    key,
    ...IT_OPS_SCENARIOS[key]
  }));
};

// Made with Bob
