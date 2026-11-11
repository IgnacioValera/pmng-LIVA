pipeline{
    agent any
    environment {
        COMPOSE_PROJECT_NAME = ''
        COMPOSE_FILE = 'docker-compose.yml'
        ENV_FILE = credentials('pmng-env')
    }
    stages {
        stage('Detener servicios'){
            steps{
                echo 'Deteniendo contenedores...'
                sh '''
                    docker compose -p ${COMPOSE_PROJECT_NAME} -f ${COMPOSE_FILE} --env-file ${ENV_FILE} down
                '''
            }
        }
        
        stage('Eliminar imagenes'){
            steps{
                echo 'Eliminando imágenes anteriores'
                sh '''
                    IMAGES=$(docker compose -p ${COMPOSE_PROJECT_NAME} -f ${COMPOSE_FILE} --env-file ${ENV_FILE} config --images | sort -u)
                    for IMAGE in "$IMAGES"; do
                        echo "Eliminando imagen: $IMAGE"
                        docker rmi "$IMAGE" || true
                    done
                '''
            }
        }
        stage('Construir proyectos'){
            steps{
                echo 'Construyendo nuevas imágenes...'
                sh '''
                    docker compose -p ${COMPOSE_PROJECT_NAME} -f ${COMPOSE_FILE} --env-file ${ENV_FILE} build --no--cache
                '''
            }
        }
        stage('Levantar servicios'){
            steps{
                echo 'Levantando contenedores...'
                sh '''
                    docker compose -p ${COMPOSE_PROJECT_NAME} -f ${COMPOSE_FILE} --env-file ${ENV_FILE} up -d
                '''
            }
        }
    }
    post {
        success{
            echo 'Ejecución pipeline finalizada'

        }

        failure{
            echo 'Error la ejecutar el pipeline'
        }

        always{

        }
    }

}