# ProcStudio Testing 

Test Suit for ProcStudio in _staging using playwright: 
<!-- - npm test create -- --type=pessoaFisica --capacity=random -->
- npm test create -- --type=pessoaFisica --capacity=Capaz
- npm test create -- --type=pessoaFisica --capacity="Relativamente Incapaz" 
- npm test create -- --type=pessoaFisica --capacity="Absolutamente Incapaz"
- npm test create -- --type=pessoaJuridica
- npm test create -- --type=contador
- npm test create -- --type=representanteLegal
- npm test create -- --type=tarefa
- npm test create -- --type=usuario
- npm test create -- --type=escritorio

# Fake E-mail Testing
- Zoho: Muito complexo (oAuth);
- Outros Serviços: O e-mail não chega, parece que já é filtrado como fake email;
- https://temp-mail.io/ => Única alternativa viável se for mesmo necessário;

## ToDo
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
- [./PageObjects/CustomerCompanyPage.js:24]     Não adianta, as vees o CEP dá algum tipo de erro, ou não possui Bairro ou Endereço
- [./PageObjects/CustomerCompanyPage.js:69]     Arrumar lógica aqui porque o método customer representative
- [./PageObjects/CustomerFinalPage.js:89]     Implementar randomizacao no futuro 
- [./index.js:96]         Corrigir as rotas para não ficar mudando depois entre staging e produção toda hora -- config routes? 
- [./Helpers/customerBackendValidator.js:123]     Fix additional request to the backend for multiple phone numbers and emails
- [./Helpers/pageMapper.js:8] Fix Trabalho -> Need form validators to push "next" button
