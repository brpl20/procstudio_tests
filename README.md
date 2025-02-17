# ProcStudio Testing 

Test Suit for ProcStudio in _staging using playwright: 
- npm test create -- --type=pessoaFisica --capacity=random
- npm test create -- --type=pessoaFisica --capacity=Capaz
- npm test create -- --type=pessoaFisica --capacity="Relativamente Incapaz" 
- npm test create -- --type=pessoaFisica --capacity="Absolutamente Incapaz"
- npm test create -- --type=pessoaJuridica
- npm test create -- --type=contador
- npm test create -- --type=representanteLegal
- npm test create -- --type=tarefa
- npm test create -- --type=usuario
- npm test create -- --type=escritorio

or: 

- node index.js create -t pessoaFisica (... and other methods)

## TODO List
- [./PageObjects/CustomerPage.js:89]     Keep the method with the remaining fields
- [./PageObjects/CustomerPageRepresentative.js:46]     Fix Select Representative for Company
- [./PageObjects/CustomerPageRepresentative.js:47]     Selectors not working
- [./PageObjects/CustomerFinalPage.js:88]     Implementar randomizacao no futuro 
- [./PageObjects/CustomerContactPage.js:19]   Fix to 0.5 when problem is solved
- [./PageObjects/CustomerContactPage.js:20]   Create Card to Solve + Problem in Playwright
- [./PageObjects/CustomerContactPage.js:21]   Test using another library?
- [./index.js:93]         Corrigir as rotas para não ficar mudando depois entre staging e produção toda hora -- config routes? 
- [./index.js:131] Argv pessoa fisica relativamente incaapz -> Não está funcionando -> Passa sem argumento e vai para o random 
- [./Helpers/pageMapper.js:8] Fix Trabalho -> Need form validators to push "next" button

## Fase 1
<!-- - Arrumar "Senha do INSS" -->
<!-- - Aguardar alterações do front => `+` e `download` -->
<!-- - Terminar Sistema: Helpers + API Requests para comparar Front com Back + Docs -->
- Corrigir parâmetros;
- Adicionar emails e telefones adicionais (+);
- Aguardar autoatribuição do representante;
- Adicionar parâmetro: IA ON/OFF;
- Limpar Código + cl em geral;
- Download direto da Aws => Pasta Downloads;
- Adicionar mais tempo de espera para API do CEP; 
- Atualizar e ajustar métodos novos: Contador / Escritório / Usuário / Representante (Direto)

# Fase 2
- Ajustar Assertions;
- Ajustar código para seguir diretrizes do PlayWright;
- Ajustar Views;
- Testar Campos Obrigatórios;
- Criar método de new Work (Hard);

# Aprendizados
- Usar mais debugging do Playwright => `await this.page.pause(); // resume para continuar`
- Aprender mais métodos de debugging