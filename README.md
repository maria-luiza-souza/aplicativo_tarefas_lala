# ULALÁ

Aplicação web responsiva para organização pessoal de tarefas, projetos, anotações, prazos e produtividade.

## Stack profissional

- React
- TypeScript
- Vite
- Firebase Authentication
- Cloud Firestore
- Chart.js / react-chartjs-2
- PWA
- GitHub Actions
- GitHub Pages

## Arquitetura

A nova versão profissional está em \`app/\`.

- \`src/components/\` — componentes reutilizáveis
- \`src/pages/\` — telas da aplicação
- \`src/workspace.tsx\` — estado e sincronização com Firestore
- \`src/firebase.ts\` — infraestrutura Firebase
- \`src/types.ts\` — contratos TypeScript
- \`src/utils.ts\` — funções utilitárias
- \`src/styles.css\` — design system responsivo

A versão HTML original foi preservada em \`legacy/index.html\` durante a migração.

## Funcionalidades

- Login com Google
- Sincronização em tempo real com Firestore
- Meu Dia com foco, progresso e indicadores
- Gestão completa de tarefas
- Kanban com drag and drop
- Calendário mensal
- Anotações
- Dashboard com indicadores e gráficos
- Recorrência de tarefas
- Layout responsivo para desktop e celular
- PWA instalável
- Persistência local como fallback

## Executar localmente

    cd app
    npm install
    npm run dev

## Validar o projeto

    npm run typecheck
    npm run build

## Deploy

O workflow \`.github/workflows/deploy-react-pages.yml\` compila a aplicação e publica \`app/dist\` no GitHub Pages.

No GitHub, use **Settings → Pages → Source → GitHub Actions** para ativar a nova versão React no endereço público.

## Firebase

A configuração pública atual do projeto possui valores de fallback em \`src/firebase.ts\`. Para ambientes separados, copie \`.env.example\` para \`.env.local\` e configure as variáveis \`VITE_FIREBASE_*\`.
