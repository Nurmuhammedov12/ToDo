def buildImageFrontend(){
    echo "building the docker image for Frontend"
    withCredentials([usernamePassword(credentialsId: 'docker-hub-repo', passwordVariable: 'PASS', usernameVariable: 'USER')]){
        sh 'docker build -t nurmuhammedowyhlas/todo-app:jma-1.1 ./frontend'
        sh 'echo $PASS | docker login -u $USER --password-stdin'
        sh 'docker push nurmuhammedowyhlas/todo-app:jma-1.0'

   }             
}
def buildImageBackend(){
    echo "building the docker image for Backend"
    withCredentials([usernamePassword(credentialsId: 'docker-hub-repo', passwordVariable: 'PASS', usernameVariable: 'USER')]){
        sh 'docker build -t nurmuhammedowyhlas/todobackend:jma-1.0 ./backend'
        sh 'echo $PASS | docker login -u $USER --password-stdin'
        sh 'docker push nurmuhammedowyhlas/todobackend:jma-1.0'
   }  
}

def deployApp(){
    echo "deploying app"
}
return this
