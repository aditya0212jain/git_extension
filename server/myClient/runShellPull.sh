ARG=$(node argShellPull.js)
ARG1=($ARG)
WORKINGFOLDER=${ARG1[0]}
SERVERFOLDER=${ARG1[1]}
REPO=${ARG1[2]}
BRANCH1=${ARG1[3]}
BRANCH2=${ARG1[4]}
SP="_"
#rm -r -f $SERVERFOLDER/$REPO*
#rm -r -f $SERVERFOLDER/$REPO$SP$BRANCH1
#rm -r -f $SERVERFOLDER/$REPO$SP$BRANCH2
if [ -d $SERVERFOLDER ]
   then
      echo "serverRepos exist"
   else
      mkdir $SERVERFOLDER
fi
if [ -d $SERVERFOLDER/$REPO$SP$BRANCH1 ]   # for file "if [-f /home/rama/file]"
   then
      echo "dir present"
      cd $SERVERFOLDER/$REPO$SP$BRANCH1
      git checkout $BRANCH1
      echo "now check out"
   else
      echo "dir not present"
      cp -r $WORKINGFOLDER/$REPO $SERVERFOLDER/
      cd $SERVERFOLDER/$REPO
      git checkout $BRANCH1
      cd ..
      mv $REPO $REPO$SP$BRANCH1
fi
if [ -d $SERVERFOLDER/$REPO$SP$BRANCH2 ]   # for file "if [-f /home/rama/file]"
   then
      echo "dir present"
      cd $SERVERFOLDER/$REPO$SP$BRANCH2
      git checkout $BRANCH2
      echo "now check out"
   else
      echo "dir not present"
      cp -r $WORKINGFOLDER/$REPO $SERVERFOLDER/
      cd $SERVERFOLDER/$REPO
      git checkout $BRANCH2
      cd ..
      mv $REPO $REPO$SP$BRANCH2
fi
#cp -r $WORKINGFOLDER/$REPO $SERVERFOLDER
#cd $SERVERFOLDER/$REPO
#git checkout $BRANCH2
#cd ..
#mv $REPO $REPO$SP$BRANCH2
#cp -r $WORKINGFOLDER/$REPO $SERVERFOLDER
#cd $SERVERFOLDER/$REPO
#git checkout $BRANCH1
#cd ..
#mv $REPO $REPO$SP$BRANCH1
#echo pullDone
