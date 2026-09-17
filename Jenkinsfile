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
        stage("build image for frontend"){
            steps {
                script{
                   gv.buildImageFrontend()
                }

            }
        }
        stage("build image for backend"){
            steps {
                script{
                   gv.buildImageBackend()
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