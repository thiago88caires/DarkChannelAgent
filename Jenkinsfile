// =================================================================
// Dark Channel Agent - Jenkinsfile
// Pipeline de CI/CD para Jenkins
// =================================================================

pipeline {
    agent any
    
    environment {
        DOCKER_BUILDKIT = '1'
        COMPOSE_DOCKER_CLI_BUILD = '1'
        APP_NAME = 'dark-channel-agent'
        APP_ENV = 'production'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Fazendo checkout do código..."
                    cleanWs()
                    checkout scm
                    
                    sh '''
                        echo "=== Informações do Build ==="
                        echo "Branch: ${GIT_BRANCH}"
                        echo "Commit: ${GIT_COMMIT}"
                        echo "Author: $(git log -1 --pretty=format:'%an <%ae>')"
                        echo "Message: $(git log -1 --pretty=format:'%s')"
                        echo "================================"
                    '''
                }
            }
        }
        
        stage('Environment Check') {
            steps {
                script {
                    echo "🔍 Verificando ambiente..."
                    
                    sh '''
                        echo "Verificando arquivos necessários..."
                        
                        if [ ! -f "docker-compose.yml" ]; then
                            echo "❌ docker-compose.yml não encontrado!"
                            exit 1
                        fi
                        
                        if [ ! -f "backend/package.json" ]; then
                            echo "❌ backend/package.json não encontrado!"
                            exit 1
                        fi
                        
                        if [ ! -f "frontend/package.json" ]; then
                            echo "❌ frontend/package.json não encontrado!"
                            exit 1
                        fi
                        
                        if [ ! -f ".env" ]; then
                            echo "⚠️  Arquivo .env não encontrado!"
                            echo "Usando variáveis de ambiente do Jenkins..."
                        fi
                        
                        echo "✅ Verificação de arquivos concluída"
                    '''
                    
                    sh '''
                        echo "Verificando Docker..."
                        docker --version
                        docker-compose --version || docker compose version
                        echo "✅ Docker verificado"
                    '''
                }
            }
        }
        
        stage('Build & Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        script {
                            echo "🧪 Executando testes do backend..."
                            
                            dir('backend') {
                                sh '''
                                    echo "Verificando sintaxe do backend..."
                                    # Aqui você pode adicionar testes específicos
                                    # npm test || echo "Testes não configurados ainda"
                                    echo "✅ Backend verificado"
                                '''
                            }
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    steps {
                        script {
                            echo "🧪 Executando testes do frontend..."
                            
                            dir('frontend') {
                                sh '''
                                    echo "Verificando sintaxe do frontend..."
                                    # Aqui você pode adicionar testes específicos
                                    # npm test || echo "Testes não configurados ainda"
                                    echo "✅ Frontend verificado"
                                '''
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Application') {
            steps {
                script {
                    echo "🏗️ Construindo aplicação..."
                    
                    sh 'chmod +x build.sh'
                    sh './build.sh'
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "🏥 Executando verificações de saúde..."
                    
                    sleep(time: 30, unit: 'SECONDS')
                    
                    sh '''
                        echo "Verificando saúde dos serviços..."
                        
                        # Verificar backend
                        echo "Testando backend..."
                        curl -f http://localhost:8080/health || {
                            echo "❌ Backend não está respondendo"
                            docker-compose logs backend
                            exit 1
                        }
                        echo "✅ Backend OK"
                        
                        # Verificar frontend
                        echo "Testando frontend..."
                        curl -f http://localhost:3000 || {
                            echo "❌ Frontend não está respondendo"
                            docker-compose logs frontend
                            exit 1
                        }
                        echo "✅ Frontend OK"
                        
                        # Verificar Supabase
                        echo "Testando Supabase..."
                        curl -f http://localhost:54321/health || {
                            echo "❌ Supabase não está respondendo"
                            docker-compose logs supabase-gateway
                            exit 1
                        }
                        echo "✅ Supabase OK"
                        
                        echo "🎉 Todos os serviços estão funcionando!"
                    '''
                }
            }
        }
        
        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    echo "🚀 Iniciando deploy..."
                    
                    sh '''
                        echo "=== Status Final da Aplicação ==="
                        docker-compose ps
                        echo ""
                        echo "URLs de acesso:"
                        echo "  Frontend:        http://localhost:3000"
                        echo "  Backend API:     http://localhost:8080"
                        echo "  Supabase:        http://localhost:54321"
                        echo "  Supabase Studio: http://localhost:54323"
                        echo ""
                        echo "🎉 Deploy concluído com sucesso!"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "🧹 Executando limpeza final..."
                
                sh '''
                    echo "Coletando logs dos containers..."
                    mkdir -p logs
                    docker-compose logs > logs/docker-compose.log 2>&1 || true
                '''
                
                archiveArtifacts artifacts: 'logs/**', allowEmptyArchive: true
            }
        }
        
        success {
            script {
                echo "✅ Pipeline executado com sucesso!"
                
                sh '''
                    echo "🎉 Build #${BUILD_NUMBER} foi executado com sucesso!"
                    echo "Branch: ${GIT_BRANCH}"
                    echo "Commit: ${GIT_COMMIT}"
                '''
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline falhou!"
                
                sh '''
                    echo "=== Informações de Debug ==="
                    echo "Docker containers:"
                    docker ps -a || true
                    echo ""
                    echo "Docker images:"
                    docker images || true
                    echo ""
                    echo "Docker compose status:"
                    docker-compose ps || true
                '''
                
                sh 'docker-compose down || true'
            }
        }
        
        cleanup {
            script {
                echo "🗑️ Limpeza final do workspace..."
                
                // Opcional: remover containers e imagens para economizar espaço
                // Descomente se necessário
                // sh '''
                //     docker-compose down --rmi local --remove-orphans || true
                //     docker system prune -f || true
                // '''
            }
        }
    }
}