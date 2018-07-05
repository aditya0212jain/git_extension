ARG=$(node argShellBlob.js)
ARG1=($ARG)
WORKINGFOLDER=${ARG1[0]}
SERVERFOLDER=${ARG1[1]}
REPO=${ARG1[2]}
BRANCH=${ARG1[3]}
SP="_"
echo $WORKINGFOLDER
echo $SERVERFOLDER
echo $REPO
echo $BRANCH
echo "Hello World"
#rm -r -f $SERVERFOLDER/$REPO*
#rm -r -f $SERVERFOLDER/$REPO$SP$BRANCH
if [ -d $SERVERFOLDER ]
   then
      echo "serverRepos exist"
   else
      mkdir $SERVERFOLDER
fi
if [ -d $SERVERFOLDER/$REPO$SP$BRANCH ]   # for file "if [-f /home/rama/file]"
   then
      echo "dir present"
      cd $SERVERFOLDER/$REPO$SP$BRANCH
      git checkout $BRANCH
      echo "now check out"
   else
      echo "dir not present"
      cp -r $WORKINGFOLDER/$REPO $SERVERFOLDER/
      cd $SERVERFOLDER/$REPO
      git checkout $BRANCH
      cd ..
      mv $REPO $REPO$SP$BRANCH
fi
#echo ${ARG1[0]}
#echo ${ARG1[1]}
#echo ${ARG1[2]}
#echo ${ARG1[3]}
