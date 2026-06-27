# Vela — contexte produit (pour IA)

> Doc à fournir comme contexte à une IA avant de générer du contenu (posts LinkedIn,
> emails, pubs, scripts). Le produit et la copy sont en anglais ; ce contexte est en
> français. Métriques marquées « placeholder » = pas encore réelles, ne pas les citer.

## Pitch en une phrase
**Vela** est un agent CRO autonome : tu connectes ton repo GitHub, il audite ton code,
écrit des variantes de tes landing pages / onboarding / paywalls en **vrai code (PR +
feature flag)**, les A/B teste sur ton trafic réel, mesure les **leads qualifiés** (pas les
clics), et itère — en boucle, avec validation humaine par défaut.

## Pitch 30 secondes
La plupart des équipes savent que leur landing sous-convertit, mais l'optimisation est lente :
une agence CRO coûte cher et rend des slides, un outil de testing te laisse tout faire à la
main, et un recrutement interne prend des mois. Vela fait le boulot de bout en bout, en
autonomie : il trouve les opportunités, écrit le code, ouvre la PR, lance le test, lit les
résultats, et recommence. Tu gardes le contrôle — chaque changement est un diff reviewable,
et rien ne part en prod sans ton OK (curseur d'autonomie ajustable).

## Le problème
- Le CRO classique est **lent, cher et finit dans le backlog**. Les recos d'agence ne se
  shippent jamais ; les outils d'A/B test demandent un dev + un analyste ; en interne c'est
  un poste à temps plein.
- Pire : on optimise souvent les **mauvais signaux**. Un meilleur taux de clic qui ramène des
  leads moins qualifiés, c'est une perte déguisée en gain.

## La solution / comment ça marche (la boucle)
1. **Audit** — l'agent analyse le repo et la page, sort un audit (surfaces détectées +
   opportunités classées par impact).
2. **Draft** — il écrit une ou plusieurs variantes en vrai code.
3. **A/B test** — il les déploie derrière un feature flag (PR + notre SDK léger ; ton CI
   existant déploie).
4. **Mesure** — notre SDK mesure impressions + conversions ; on calcule l'uplift et la
   significativité statistique.
5. **Décision** — ship le gagnant / itère / abandonne. Les apprentissages nourrissent le tour
   suivant.
> Review-gated par défaut : l'humain valide avant tout déploiement. Le curseur d'autonomie
> peut être desserré avec le temps (semi-auto → autonome + garde-fous).

## Ce qui nous démarque
- **Vrai code, pas un éditeur visuel** : chaque variante est un diff reviewable dans une PR,
  versionné dans ton repo.
- **On optimise les leads qualifiés, pas les clics vanity** : la vraie valeur business, pas la
  métrique de surface.
- **Autonome mais sous contrôle** : l'agent fait le travail, tu gardes les gates qui comptent.
- **On dogfoode** : notre propre landing est optimisée par l'agent. L'audit gratuit qu'on
  offre, c'est littéralement la première passe du produit.

## Cible (ICP)
Founders et growth/marketing leads de **startups SaaS B2B** qui :
- ont une landing / un onboarding / un paywall qui sous-convertit,
- veulent plus de **leads qualifiés** sans monter une équipe CRO,
- sont à l'aise avec « c'est dans notre repo » (équipe tech présente).

## Proposition de valeur (par bénéfice)
- **Plus de leads qualifiés** à trafic constant.
- **Vitesse** : des tests qui tournent en continu, pas un projet trimestriel.
- **Zéro lock-in visuel** : tout est du code à toi, reviewable.
- **Confiance** : activité de l'agent loggée, déploiements gated.

## Entonnoir d'acquisition (business)
- **Top of funnel — l'audit gratuit (lead magnet)** : page sans login, tu colles l'URL de ta
  landing, Claude sort un audit CRO (score /100 + 4-6 recos actionnables priorisées avec
  citations de ta page). Pensé pour être **partagé sur LinkedIn** (chaque résultat a une URL
  partageable avec Open Graph). Chaque audit lancé = un lead capturé.
- **Conversion principale — Book a demo.** L'audit pousse vers « tu veux que l'agent corrige
  ça automatiquement ? → réserve une démo ».

## Positionnement vs alternatives
| | Vela | Agence CRO | Outil d'A/B test | Recrutement interne |
|---|---|---|---|---|
| Écrit le code | ✓ | — | — | ✓ (lent) |
| Autonome / en continu | ✓ | — | — | — |
| Optimise les leads qualifiés | ✓ | parfois | — | parfois |
| Coût | $ | $$$ | $$ | $$$$ |
| Délai avant le 1er test | jours | semaines | jours | mois |

## Ton de marque
Direct, précis, « builder pas consultant ». On nomme les choses concrètement (le fichier, la
métrique, le diff). Pas de jargon corporate, pas de promesses gonflées. Esthétique « Warm
Precision » : rigueur d'outil de dev (chiffres tabulaires, bordures fines) sur un fond beige
chaleureux avec un orange affirmé.

## Taglines / accroches (copy réelle du site, en anglais)
- « Your landing optimizes itself. In real code. »
- « The CRO agent that ships, not advises. »
- « Find out why your landing isn't converting — in 30 seconds. »
- « Measure leads, not clicks. »

## Infos pratiques
- **Nom** : Vela (catégorie : auto-CRO).
- **Site / démo** : https://lead.159.69.41.115.sslip.io (audit gratuit sur `/audit`).
- **Statut** : early-stage, en acquisition (objectif : ramener un max de trafic via le lead
  magnet, convertir en démos).
- **Note** : les logos clients et les métriques de preuve affichés (+34%, etc.) sont des
  **placeholders** pour l'instant — ne pas les présenter comme réels.
