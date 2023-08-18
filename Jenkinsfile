pipeline {
  agent any
  options {
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }
  environment {
    DOCKERHUB_CREDENTIALS = credentials('dockerhub')
  }
  stages {
    stage('Build') {
      steps {
        sh 'docker build -t nodejs_backend:v3 .'
      }
    }
    stage('Login') {
      steps {
        sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
      }
    }
    stage('Tag and Push') {
            steps {
                sh 'docker tag nodejs_backend:v3 geoffrick/customerportal:backend'
                sh 'docker push geoffrick/customerportal:backend'
            }
        }
  }
  post {
    always {
      sh 'docker logout'
    }
  }
}