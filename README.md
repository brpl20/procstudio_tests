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

- [./PageObjects/CustomerPage.js:93]     CleanUP This code
- [./PageObjects/CustomerPageRepresentative.js:46]     Fix Select Representative for Company
- [./PageObjects/CustomerPageRepresentative.js:47]     Selectors not working
- [./PageObjects/CustomerFinalPage.js:88]     Implementar randomizacao no futuro 
- [./PageObjects/CustomerContactPage.js:19]   Fix to 0.5 when problem is solved
- [./PageObjects/CustomerContactPage.js:20]   Create Card to Solve + Problem in Playwright
- [./PageObjects/CustomerContactPage.js:21]   Test using another library?
- [./Helpers/pageMapper.js:8] Fix Trabalho -> Need form validators to push "next" button

- [./PageObjects/CustomerPage.js:93]     CleanUP This code
- [./PageObjects/CustomerPageRepresentative.js:46]     Fix Select Representative for Company
- [./PageObjects/CustomerPageRepresentative.js:47]     Selectors not working
- [./PageObjects/CustomerFinalPage.js:88]     Implementar randomizacao no futuro 
- [./PageObjects/CustomerContactPage.js:19]   Fix to 0.5 when problem is solved
- [./PageObjects/CustomerContactPage.js:20]   Create Card to Solve + Problem in Playwright
- [./PageObjects/CustomerContactPage.js:21]   Test using another library?

- [./PageObjects/CustomerPage.js:93]     CleanUP This code
- [./PageObjects/CustomerFinalPage.js:88]     Implementar randomizacao no futuro 
- [./PageObjects/CustomerContactPage.js:19]   Fix to 0.5 when problem is solved
- [./PageObjects/CustomerContactPage.js:20]   Create Card to Solve + Problem in Playwright
- [./PageObjects/CustomerContactPage.js:21]   Test using another library?

- [./PageObjects/CustomerPage.js:93]     CleanUP This code
- [./PageObjects/CustomerContactPage.js:19]   Fix to 0.5 when problem is solved
- [./PageObjects/CustomerContactPage.js:20]   Create Card to Solve + Problem in Playwright
- [./PageObjects/CustomerContactPage.js:21]   Test using another library?

- [./PageObjects/CustomerPage.js:92]     CleanUP This code


## Other Notes..
- Arrumar "Senha do INSS"
- Aguardar alterações do front => `+` e `download`
- Guardar Dados Criados para fazer comparação com o documento (Qual melhor metodologia para isso?)
- Atualizar e ajustar métodos novos: Contador / Escritório / Usuário / Representante (Direto)
- Criar método de new Work;