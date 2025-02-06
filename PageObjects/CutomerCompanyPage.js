const { findFillableFormElements } = require('./helpers/formHelper');
// TD: Criar essa lógica 
(async () => {
  const fillableElements = await findFillableFormElements(page);
  console.log(fillableElements);
});