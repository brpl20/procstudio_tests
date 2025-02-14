  "representativeNationality":
    "frontend": "Estrangeiro",
    "backend": "foreigner",
    "match": false



  "representativeGender": {
    "frontend": "Masculino",
    "backend": "female",
    "match": false

  "representativeCivilStatus": {
    "frontend": "Casado",
    "backend": "divorced",
    "match": false

    ==> Arrumar ENUMS en/pt

  "representativeName": {
    "frontend": "Baylee Koss",
    "backend": null,
    "match": false
  },

  ==> Remover esse campo repitido


  "civilStatus": {
    "frontend": "União Estável",
    "backend": "union",
    "match": false

    ==> Ajustar validação União Estável -> Provavelmente o acento tá dando erro


  "birthDate": {
    "frontend": "22/12/2009",
    "backend": "2009-12-22",
    "match": true

    ==> Arrumar validação nascimento (repetido?)

  "cep": {
    "frontend": "65020909",
    "backend": "65020-909",
    "match": false

    ==> Arrumar validação cep


  "phoneNumber": {
    "frontend": "6394461925",
    "backend": "(63) 9446-1925",
    "match": false
  },


  ==> Arrumar validação telefone


  "email": {
    "frontend": "Orpha.Grant48@yahoo.com",
    "backend": "Orpha.Grant48@yahoo.com",
    "match": true
  },


  ==> Forçar lowercase aqui


  "bank": {
    "frontend": "BCO DO BRASIL S.A.",
    "backend": "",
    "match": false
  },

  ==> Verificar como isso está no backend
