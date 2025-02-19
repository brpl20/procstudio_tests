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

<!-- - Arrumar "Senha do INSS" -->
<!-- - Aguardar alterações do front => `+` e `download` -->
<!-- - Terminar Sistema: Helpers + API Requests para comparar Front com Back + Docs -->
<!-- - Corrigir parâmetros; -->
<!-- - Adicionar emails e telefones adicionais (+); -->
<!-- - Aguardar autoatribuição do representante; -->
<!-- - Desativar IA Methods; -->
<!-- - Download direto da Aws => Desativar; -->
<!-- - Mamoth => Desativar até ser necessário IA e comparação;  -->
<!-- - Adicionar mais tempo de espera para API do CEP;  -->
- Limpar Código + cl em geral;
- Atualizar e ajustar métodos novos: 
    - Representante (Direto); 
    - Contador; 
    - Pessoa Jurídica - Atualizar conforme novos utils; 
    - Escritório;
    - Usuário; 
- Corrigir bug de selecionar o representante (nomes muito grandes não estão funcionando direito)

# Fase 2
- Ajustar Assertions;
- Ajustar código para seguir diretrizes do PlayWright;
- Ajustar Views;
- Testar Campos Obrigatórios;
- Criar método de new Work (Hard);

# Aprendizados
- Usar mais debugging do Playwright => `await this.page.pause(); // resume para continuar`
- Aprender mais métodos de debugging

## TODO List

- [./PageObjects/CustomerPageAddress.js:21]     Fix when proper testing suit is set up
- [./PageObjects/CustomerPage.js:94]     Keep the method with the remaining fields
- [./PageObjects/CustomerFinalPage.js:89]     Implementar randomizacao no futuro 
- [./index.js:96]         Corrigir as rotas para não ficar mudando depois entre staging e produção toda hora -- config routes? 
- [./Helpers/customerBackendValidator.js:123]     Fix additional request to the backend for multiple phone numbers and emails
- [./Helpers/pageMapper.js:8] Fix Trabalho -> Need form validators to push "next" button
