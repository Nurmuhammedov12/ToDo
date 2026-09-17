def buildImage(){
    echo "building the docker image..."
    withCredentials([usernamePassword(credentialsId: 'docker-hub-repo', passwordVariable: 'PASS', usernameVariable: 'USER')]){
        sh 'docker build -t nurmuhammedowyhlas/todo-app:jma-1.0 ./backend'
        sh 'echo $PASS | docker login -u $USER --password-stdin'
        sh 'docker push nurmuhammedowyhlas/todo-app:jma-1.0'

   }             
}

def deployApp(){
    echo "deploying app"
}
return this
