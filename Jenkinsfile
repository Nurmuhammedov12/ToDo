#!/user/bin/env groovy

@Library('jenkins-shared-library')
def gv

pipeline {
    agent any 
    stages {
        stage("init"){
            steps{
                script{
                    gv = load "script.groovy"
                }
            }
        }

        stage("build image for frontend/backend"){
            input {
            message "Deploy which version?"
            ok "Deploy"
            parameters {
                choice(name:'IMAGE_NAME',choices: ['nurmuhammedowyhlas/todo-app:jma-4.0', 'nurmuhammedowyhlas/todobackend:jma-3.0'],description: 'Which Image Name')
                choice(name:'LOCATION',choices: ['frontend', 'backend'],description: 'choose location')
            }
    }
            steps {
                script{
                 buildImage(IMAGE_NAME,LOCATION) 
                 dockerLogin()
                 dockerPush(IMAGE_NAME)
                }

            }
        }

        stage("deploy"){
            steps{
                script{
                    gv.deployApp()
                }
            }
        }
    }
}
