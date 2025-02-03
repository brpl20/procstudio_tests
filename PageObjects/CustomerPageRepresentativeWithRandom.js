// Nao finalizado ainda 
// Precisa de ajuste na requisição
// Filtrando os Representante

async addRepresentative() {
    const shouldCreateNewRepresentative = Math.random() < 0.5;

    if (shouldCreateNewRepresentative) {
      await this.createNewRepresentative();
    } else {
      console.log('Picking an existing representative...');
      if (this.customersWithRepresentatives.length > 0) {
        const randomRepresentative = generateRandomItem(this.customersWithRepresentatives);
        console.log(`Selected existing representative: ${randomRepresentative.representative.name}`);

        await this.page.getByRole('button', { name: 'Adicionar Representante' }).click();
        const modal = this.page.locator('div:has-text("Dados do Representante")');

        await modal.getByPlaceholder('Informe o Nome do Representante').fill(randomRepresentative.representative.name);
        await modal.getByPlaceholder('Informe o Sobrenome do Representante').fill(randomRepresentative.representative.last_name);
        await modal.getByPlaceholder('Informe o CPF').fill(randomRepresentative.representative.cpf);
        await modal.getByPlaceholder('Informe o RG').fill(randomRepresentative.representative.rg);

        await modal.getByRole('button', { name: 'Salvar' }).click();
      } else {
        console.log('No existing representatives found. Creating a new one...');
        await this.createNewRepresentative();
      }
    }
  }

  async createNewRepresentative() {
    console.log('Creating a new representative...');
    await this.page.getByRole('button', { name: 'Adicionar Representante' }).click();

    const modal = this.page.locator('div:has-text("Dados do Representante")');

    await modal.getByPlaceholder('Informe o Nome do Representante').fill(faker.person.firstName());
    await modal.getByPlaceholder('Informe o Sobrenome do Representante').fill(faker.person.lastName());
    await modal.getByPlaceholder('Informe o CPF').fill(generateCPF());
    await modal.getByPlaceholder('Informe o RG').fill(generateRG());

    const birthDateRepresentative = generateBirthDate(18, 90);
    await modal.getByPlaceholder('DD/MM/YYYY').fill(birthDateRepresentative);

    await this.selectDropdownOption('nationality', ['Brasileiro', 'Estrangeiro']);
    await this.selectDropdownOption('gender', ['Masculino', 'Feminino']);
    await this.selectDropdownOption('civil_status', ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']);

    await modal.getByPlaceholder('Informe o Profissão').fill(faker.person.jobTitle());

    await modal.getByPlaceholder('Informe o CEP').fill(faker.location.zipCode('#####-###'));
    await modal.getByPlaceholder('Informe o Bairro').fill(faker.location.county());
    await modal.getByPlaceholder('N.º').fill(faker.location.buildingNumber());
    await modal.getByPlaceholder('Informe o Cidade').fill(faker.location.city());
    await modal.getByPlaceholder('Informe o Complemento').fill('Apto ' + faker.location.buildingNumber());
    await modal.getByPlaceholder('Informe o Estado').fill(faker.location.state());

    await modal.getByRole('button', { name: 'Salvar' }).click();
    console.log('New representative created successfully.');
  }