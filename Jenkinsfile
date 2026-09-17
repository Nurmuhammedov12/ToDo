#!/user/bin/env groovy

@Library('jenkins-shared-library')
def gv

pipeline {
    agent any
    parameters {
        choice(
            name:'IMAGE_NAME',
            choices: ['nurmuhammedowyhlas/todo-app:jma-4.0', 'nurmuhammedowyhlas/todobackend:jma-3.0'],
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
            when{
                expression {params.IMAGE_NAME == 'nurmuhammedowyhlas/todo-app:jma-4.0' && params.LOCATION == 'frontend'}
            }
            steps {
                script{
                 buildImage(params.IMAGE_NAME, params.LOCATION) 
                 dockerLogin()
                 dockerPush(params.IMAGE_NAME)
                }

            }
        stage("build image for backend"){
            when{
                expression {params.IMAGE_NAME == 'nurmuhammedowyhlas/todobackend:jma-3.0' && params.LOCATION == 'backend'}
            }
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
}