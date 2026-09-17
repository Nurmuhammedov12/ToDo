#!/user/bin/env groovy

@Library('jenkins-shared-library')
def gv

pipeline {
    agent any
    parameters {
        choice(
            name:'IMAGE_NAME',
            choices: ['nurmuhammedowyhlas/todo-app:jma-3.0', 'nurmuhammedowyhlas/todobackend:jma-2.0'],
            description: 'Which Image Name'
        )
        choice(
            name:'LOCATION',
            choices: ['frontend', 'backend'],
            description: 'choose location'
        )
    }
    
    stages {
        stage("init"){
            steps{
                script{
                    gv = load "script.groovy"
                }
            }
        }
        stage("build image for frontend"){
            steps {
                script{
                 buildImage(params.IMAGE_NAME, params.LOCATION) 
                 dockerLogin()
                 dockerPush(params.IMAGE_NAME)
                }

            }
        }
        stage("build image for backend"){
            steps {
                script{
                    buildImage(params.IMAGE_NAME, params.LOCATION) 
                    dockerLogin()
                    dockerPush(params.IMAGE_NAME)
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