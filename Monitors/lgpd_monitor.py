#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Monitor de Dados LGPD - Script unificado para monitorar estruturas de dados do ProcStudio (Rails) e ProcStudioIA (Laravel)
Autor: LZTEC
Data: Agosto 2025
"""

import os
import sys
import json
import yaml
import glob
import hashlib
import datetime
import requests
import subprocess
import logging
from dotenv import load_dotenv
from pathlib import Path

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("data_monitor.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("data_monitor")

# Constantes
RAILS_PATH = "/Users/brpl/code/prc_api"
LARAVEL_PATH = "/Users/brpl/code/ProcStudioIA"
# Arquivos de monitoramento serão salvos nesta pasta (pasta oculta no diretório home do usuário)
DATA_DIR = os.path.expanduser("~/.data_monitor")
TODAY = datetime.datetime.now().strftime("%Y-%m-%d")

# Carregar arquivo .env do diretório de testes
ENV_FILE = "/Users/brpl/code/procstudio_tests/.env"
if os.path.isfile(ENV_FILE):
    load_dotenv(ENV_FILE)

ENV = os.getenv('ENV')

# Assegurar que o diretório de armazenamento existe
os.makedirs(DATA_DIR, exist_ok=True)

# Carregar variáveis de ambiente (tentando de ambos os projetos)
load_dotenv(os.path.join(RAILS_PATH, '.env'))
load_dotenv(os.path.join(LARAVEL_PATH, '.env'))

# Configurações de API e notificação
TELEGRAM_TOKEN = os.getenv('TELEGRAM_BOT_TEST')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_MY_CHANNEL')
AI_API_KEY = os.getenv('OPENAI_API_KEY')
AI_API_URL = os.getenv('AI_API_URL', 'https://api.openai.com/v1/chat/completions')
AI_MODEL = os.getenv('AI_MODEL', 'gpt-4')

class DataMonitor:
    def __init__(self, project_path, framework):
        """
        Inicializa o monitor de dados para um projeto específico

        Args:
            project_path (str): Caminho para o diretório do projeto
            framework (str): 'rails' ou 'laravel'
        """
        self.project_path = project_path
        self.framework = framework.lower()
        self.history_file = os.path.join(DATA_DIR, f"{self.framework}_history.json")
        self.today_file = os.path.join(DATA_DIR, f"{self.framework}_{TODAY}.json")

        logger.info(f"Iniciando monitoramento para projeto {framework} em {project_path}")
        logger.info(f"Arquivos de monitoramento serão salvos em: {DATA_DIR}")

    def analyze_database_structure(self):
        """
        Analisa a estrutura do banco de dados com base no framework

        Returns:
            dict: Dados de estrutura do banco encontrados
        """
        db_data = {}

        if self.framework == 'rails':
            # Schema Rails
            schema_rb = os.path.join(self.project_path, 'db', 'schema.rb')
            if os.path.exists(schema_rb):
                db_data['schema.rb'] = self._read_file(schema_rb)

            # Migrações Rails
            migrations = glob.glob(os.path.join(self.project_path, 'db', 'migrate', '*.rb'))
            for migration in migrations:
                db_data[f"migration/{os.path.basename(migration)}"] = self._read_file(migration)

        elif self.framework == 'laravel':
            # Migrações Laravel
            migrations = glob.glob(os.path.join(self.project_path, 'database', 'migrations', '*.php'))
            for migration in migrations:
                db_data[f"migration/{os.path.basename(migration)}"] = self._read_file(migration)

            # Schema Laravel (se existir)
            schema_dump = os.path.join(self.project_path, 'database', 'schema', 'mysql-schema.dump')
            if os.path.exists(schema_dump):
                db_data['mysql-schema.dump'] = self._read_file(schema_dump)

        logger.info(f"Encontrados {len(db_data)} arquivos de estrutura de banco de dados")
        return db_data

    def analyze_models(self):
        """
        Analisa os modelos de dados com base no framework

        Returns:
            dict: Dados dos modelos encontrados
        """
        model_data = {}

        if self.framework == 'rails':
            # Modelos Rails
            models = glob.glob(os.path.join(self.project_path, 'app', 'models', '**', '*.rb'), recursive=True)
            for model in models:
                rel_path = os.path.relpath(model, self.project_path)
                model_data[rel_path] = self._read_file(model)

        elif self.framework == 'laravel':
            # Modelos Laravel
            models = glob.glob(os.path.join(self.project_path, 'app', 'Models', '**', '*.php'), recursive=True)
            for model in models:
                rel_path = os.path.relpath(model, self.project_path)
                model_data[rel_path] = self._read_file(model)

        logger.info(f"Encontrados {len(model_data)} arquivos de modelo")
        return model_data

    def analyze_external_services(self):
        """
        Identifica serviços externos e APIs utilizadas no projeto

        Returns:
            dict: Dados dos serviços externos encontrados
        """
        services_data = {}

        if self.framework == 'rails':
            # Serviços e initializers do Rails
            services = glob.glob(os.path.join(self.project_path, 'app', 'services', '**', '*.rb'), recursive=True)
            initializers = glob.glob(os.path.join(self.project_path, 'config', 'initializers', '*.rb'))

            for service in services + initializers:
                rel_path = os.path.relpath(service, self.project_path)
                services_data[rel_path] = self._read_file(service)

            # Gemfile para dependências
            gemfile = os.path.join(self.project_path, 'Gemfile')
            if os.path.exists(gemfile):
                services_data['Gemfile'] = self._read_file(gemfile)

            gemfile_lock = os.path.join(self.project_path, 'Gemfile.lock')
            if os.path.exists(gemfile_lock):
                services_data['Gemfile.lock'] = self._read_file(gemfile_lock)

        elif self.framework == 'laravel':
            # Serviços e providers do Laravel
            services = glob.glob(os.path.join(self.project_path, 'app', 'Services', '**', '*.php'), recursive=True)
            providers = glob.glob(os.path.join(self.project_path, 'app', 'Providers', '*.php'))
            configs = glob.glob(os.path.join(self.project_path, 'config', '*.php'))

            for service in services + providers + configs:
                rel_path = os.path.relpath(service, self.project_path)
                services_data[rel_path] = self._read_file(service)

            # Composer para dependências
            composer_json = os.path.join(self.project_path, 'composer.json')
            if os.path.exists(composer_json):
                services_data['composer.json'] = self._read_file(composer_json)

            composer_lock = os.path.join(self.project_path, 'composer.lock')
            if os.path.exists(composer_lock):
                services_data['composer.lock'] = self._read_file(composer_lock)

        # Verificar arquivos de env para APIs
        env_example = os.path.join(self.project_path, '.env.example')
        if os.path.exists(env_example):
            services_data['.env.example'] = self._read_file(env_example)

        logger.info(f"Encontrados {len(services_data)} arquivos relacionados a serviços externos")
        return services_data

    def find_ai_services(self):
        """
        Encontra serviços específicos de IA no projeto

        Returns:
            dict: Dados dos serviços de IA encontrados
        """
        ai_data = {}
        search_patterns = ['*ai*', '*gpt*', '*openai*', '*claude*', '*anthropic*', '*llm*', '*language_model*']

        # Padrões para busca em ambos os frameworks
        if self.framework == 'rails':
            base_dirs = [
                os.path.join(self.project_path, 'app', 'services'),
                os.path.join(self.project_path, 'app', 'controllers'),
                os.path.join(self.project_path, 'lib')
            ]
            extension = '.rb'
        else:  # Laravel
            base_dirs = [
                os.path.join(self.project_path, 'app', 'Services'),
                os.path.join(self.project_path, 'app', 'Http', 'Controllers'),
                os.path.join(self.project_path, 'app', 'Helpers')
            ]
            extension = '.php'

        # Buscar por padrões em cada diretório
        for base_dir in base_dirs:
            if not os.path.exists(base_dir):
                continue

            for pattern in search_patterns:
                pattern_path = os.path.join(base_dir, '**', f"*{pattern}*{extension}")
                matches = glob.glob(pattern_path, recursive=True)

                for match in matches:
                    rel_path = os.path.relpath(match, self.project_path)
                    ai_data[rel_path] = self._read_file(match)

        logger.info(f"Encontrados {len(ai_data)} arquivos relacionados a serviços de IA")
        return ai_data

    def _read_file(self, filepath):
        """
        Lê um arquivo de forma segura

        Args:
            filepath (str): Caminho do arquivo

        Returns:
            str: Conteúdo do arquivo ou mensagem de erro
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Erro ao ler arquivo {filepath}: {str(e)}")
            return f"[ERRO DE LEITURA: {str(e)}]"

    def save_current_data(self, data):
        """
        Salva os dados atuais para comparação futura

        Args:
            data (dict): Dados coletados
        """
        with open(self.today_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        # Atualizar o arquivo de histórico para uso futuro
        with open(self.history_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def load_previous_data(self):
        """
        Carrega dados da última execução

        Returns:
            dict: Dados anteriores ou None se não existirem
        """
        if not os.path.exists(self.history_file):
            return None

        try:
            with open(self.history_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Erro ao carregar dados anteriores: {str(e)}")
            return None

    def get_git_changes(self):
        """
        Verifica mudanças no Git desde a última execução

        Returns:
            dict: Mudanças detectadas pelo Git
        """
        git_changes = {
            'uncommitted': '',
            'recent_commits': ''
        }

        try:
            # Verificar se o diretório é um repositório Git
            git_dir = os.path.join(self.project_path, '.git')
            if not os.path.exists(git_dir):
                return {'error': 'Não é um repositório Git'}

            # Obter mudanças não commitadas
            os.chdir(self.project_path)
            result = subprocess.run(['git', 'status', '--porcelain'],
                                   capture_output=True, text=True, check=True)
            git_changes['uncommitted'] = result.stdout

            # Obter commits recentes (últimas 24 horas)
            yesterday = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
            result = subprocess.run(['git', 'log', f'--since="{yesterday}"', '--name-status'],
                                   capture_output=True, text=True, check=True)
            git_changes['recent_commits'] = result.stdout

        except Exception as e:
            git_changes['error'] = str(e)
            logger.error(f"Erro ao verificar mudanças Git: {str(e)}")

        return git_changes

    def analyze_with_ai(self, data):
        """
        Solicita análise dos dados coletados usando IA

        Args:
            data (dict): Dados coletados do projeto

        Returns:
            str: Análise da IA
        """
        if not AI_API_KEY:
            return "API key de IA não configurada. Não foi possível realizar a análise."

        # Preparar prompt para a IA
        prompt = f"""
        Analise as estruturas de dados de um sistema {self.framework.upper()} e identifique:

        1. Todos os campos de banco de dados que podem conter dados pessoais sensíveis (CPF, RG, endereço, etc.)
        2. APIs externas e serviços de terceiros utilizados, especialmente serviços de IA
        3. Possíveis vulnerabilidades de segurança e privacidade de dados
        4. Campos que precisam ser mencionados em uma política de privacidade LGPD

        Estruture sua resposta em seções claras.
        """

        # Adicionar dados resumidos ao prompt (para não exceder limites de tokens)
        for category, items in data.items():
            prompt += f"\n\n== {category} ==\n"
            for name, content in items.items():
                # Resumir conteúdo para não sobrecarregar a API
                if len(content) > 1000:
                    content_summary = content[:1000] + "... [conteúdo truncado]"
                else:
                    content_summary = content

                prompt += f"\n--- {name} ---\n{content_summary}\n"

        try:
            # Fazer requisição para API de IA
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {AI_API_KEY}"
            }

            payload = {
                "model": AI_MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": "Você é um assistente especializado em análise de código e conformidade com LGPD."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.2,
                "max_tokens": 2000
            }

            response = requests.post(AI_API_URL, headers=headers, json=payload)

            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                return f"Erro na API de IA: {response.status_code} - {response.text}"

        except Exception as e:
            logger.error(f"Erro ao analisar com IA: {str(e)}")
            return f"Erro ao analisar com IA: {str(e)}"

    def compare_data(self, current_data, previous_data):
        """
        Compara dados atuais com dados anteriores para identificar mudanças

        Args:
            current_data (dict): Dados atuais
            previous_data (dict): Dados anteriores

        Returns:
            dict: Mudanças encontradas
        """
        if not previous_data:
            return {"status": "Primeira execução - não há dados anteriores para comparação"}

        changes = {}

        # Comparar cada categoria
        for category in current_data:
            if category not in previous_data:
                changes[category] = "Nova categoria"
                continue

            category_changes = {}

            # Comparar cada arquivo na categoria
            for file, content in current_data[category].items():
                if file not in previous_data[category]:
                    category_changes[file] = "Novo arquivo"
                elif content != previous_data[category][file]:
                    category_changes[file] = "Modificado"

            # Verificar arquivos removidos
            for file in previous_data[category]:
                if file not in current_data[category]:
                    category_changes[file] = "Removido"

            if category_changes:
                changes[category] = category_changes

        # Verificar categorias removidas
        for category in previous_data:
            if category not in current_data:
                changes[category] = "Categoria removida"

        return changes

    def send_telegram_message(self, message):
        """
        Envia mensagem para o Telegram

        Args:
            message (str): Mensagem a ser enviada

        Returns:
            bool: True se enviado com sucesso, False caso contrário
        """
        if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
            logger.warning("Token ou Chat ID do Telegram não configurados")
            return False

        try:
            # Dividir mensagens longas (limite do Telegram é ~4096 caracteres)
            max_length = 4000
            message_parts = [message[i:i+max_length] for i in range(0, len(message), max_length)]

            for part in message_parts:
                url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
                payload = {
                    "chat_id": TELEGRAM_CHAT_ID,
                    "text": part,
                    "parse_mode": "HTML"
                }

                response = requests.post(url, json=payload)

                if response.status_code != 200:
                    logger.error(f"Erro ao enviar mensagem para Telegram: {response.text}")
                    return False

            return True

        except Exception as e:
            logger.error(f"Erro ao enviar mensagem para Telegram: {str(e)}")
            return False

    def run(self):
        """
        Executa o processo completo de monitoramento

        Returns:
            dict: Resultados do monitoramento
        """
        # Coletar dados atuais
        current_data = {
            "database": self.analyze_database_structure(),
            "models": self.analyze_models(),
            "services": self.analyze_external_services(),
            "ai_services": self.find_ai_services()
        }

        # Calcular hash para verificação rápida
        current_hash = hashlib.sha256(json.dumps(current_data, sort_keys=True).encode()).hexdigest()

        # Carregar dados anteriores
        previous_data = self.load_previous_data()

        if previous_data:
            previous_hash = hashlib.sha256(json.dumps(previous_data, sort_keys=True).encode()).hexdigest()
        else:
            previous_hash = None

        # Verificar se houve mudanças
        if current_hash != previous_hash:
            logger.info("Mudanças detectadas, analisando...")

            # Comparar dados para identificar alterações específicas
            changes = self.compare_data(current_data, previous_data)

            # Obter mudanças Git
            git_changes = self.get_git_changes()

            # Analisar com IA
            ai_analysis = self.analyze_with_ai(current_data)

            # Criar relatório
            report = f"""
<b>Relatório de Monitoramento LGPD - {self.framework.upper()}</b>
<b>Data:</b> {TODAY}
<b>Projeto:</b> {os.path.basename(self.project_path)}

<b>Resumo das Mudanças:</b>
{json.dumps(changes, indent=2, ensure_ascii=False)}

<b>Mudanças Git:</b>
<pre>{git_changes.get('uncommitted', 'N/A')}</pre>

<b>Commits Recentes:</b>
<pre>{git_changes.get('recent_commits', 'N/A')}</pre>

<b>Análise de IA para LGPD:</b>
{ai_analysis}
            """

            # Enviar relatório
            self.send_telegram_message(report)

            # Salvar dados atuais para futura comparação
            self.save_current_data(current_data)

            return {
                "status": "changes_detected",
                "changes": changes,
                "git_changes": git_changes,
                "ai_analysis": ai_analysis
            }
        else:
            logger.info("Nenhuma mudança detectada")

            # Criar relatório para quando não há mudanças
            no_changes_report = f"""
<b>Relatório de Monitoramento LGPD - {self.framework.upper()}</b>
<b>Data:</b> {TODAY}
<b>Projeto:</b> {os.path.basename(self.project_path)}

<b>Status:</b> Nenhuma mudança detectada desde a última verificação.
<b>Localização dos arquivos de monitoramento:</b> {DATA_DIR}
            """

            # Enviar relatório mesmo quando não há mudanças
            self.send_telegram_message(no_changes_report)

            return {
                "status": "no_changes"
            }


def main():
    """Função principal que executa o monitoramento para ambos os projetos"""
    logger.info("Iniciando monitoramento de dados LGPD")
    logger.info(f"Arquivos de monitoramento serão salvos em: {DATA_DIR}")

    # Monitorar ProcStudio (Rails)
    try:
        rails_monitor = DataMonitor(RAILS_PATH, 'rails')
        rails_result = rails_monitor.run()
        logger.info(f"Monitoramento Rails concluído: {rails_result['status']}")
    except Exception as e:
        logger.error(f"Erro no monitoramento Rails: {str(e)}")

    # Monitorar ProcStudioIA (Laravel)
    try:
        laravel_monitor = DataMonitor(LARAVEL_PATH, 'laravel')
        laravel_result = laravel_monitor.run()
        logger.info(f"Monitoramento Laravel concluído: {laravel_result['status']}")
    except Exception as e:
        logger.error(f"Erro no monitoramento Laravel: {str(e)}")

    logger.info("Monitoramento concluído")


if __name__ == "__main__":
    main()
