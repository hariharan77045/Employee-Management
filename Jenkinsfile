// CI/CD for the EmployeeHub Angular frontend.
//
// Jenkins credentials used (same as the backend job):
//   dockerhub   Username/password  - Docker Hub login (access token as password)
//   kubeconfig  Secret file        - kubeconfig for the cluster (optional)
// Vercel deploys this repo by itself on every push (Git integration), so Jenkins
// only builds, tests, publishes the nginx image and updates Kubernetes.

pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'hariharan77045'
        IMAGE          = "${DOCKERHUB_USER}/employeehub-frontend"
        TAG            = "${env.BRANCH_NAME ?: 'dev'}-${env.BUILD_NUMBER}"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npx ng build --configuration production'
            }
        }

        stage('Docker image') {
            steps {
                sh 'docker build -t $IMAGE:$TAG -t $IMAGE:latest .'
            }
        }

        stage('Push image') {
            when { branch 'dev' }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub',
                        usernameVariable: 'DH_USER', passwordVariable: 'DH_TOKEN')]) {
                    sh '''
                      echo "$DH_TOKEN" | docker login -u "$DH_USER" --password-stdin
                      docker push $IMAGE:$TAG && docker push $IMAGE:latest
                      docker logout
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when { branch 'dev' }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                      kubectl -n employeehub set image deployment/frontend frontend=$IMAGE:$TAG
                      kubectl -n employeehub rollout status deployment/frontend --timeout=180s
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f > /dev/null 2>&1 || true'
        }
    }
}
