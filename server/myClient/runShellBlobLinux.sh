#!/bin/bash
ARG=$(node argShellBlob.js)
ARG1=($ARG)
WORKINGFOLDER=${ARG1[0]}
SERVERFOLDER=${ARG1[1]}
REPO=${ARG1[2]}
BRANCH=${ARG1[3]}
AUTHOR=${ARG1[4]}
SP="_"
ATRATE="@"
#rm -r -f $SERVERFOLDER/$REPO*
#rm -r -f $SERVERFOLDER/$REPO$SP$BRANCH
if [ -d $SERVERFOLDER ]
   then
      echo "serverRepos exist"
   else
      mkdir $SERVERFOLDER
fi
if [ -d $SERVERFOLDER/$AUTHOR$ATRATE$REPO$SP$BRANCH ]   # for file "if [-f /home/rama/file]"
   then
      echo "dir present"
      cd $SERVERFOLDER/$AUTHOR$ATRATE$REPO$SP$BRANCH
      git checkout $BRANCH
   else
      echo "dir not present"
      cp -r $WORKINGFOLDER/$AUTHOR$ATRATE$REPO $SERVERFOLDER
      cd $SERVERFOLDER/$AUTHOR$ATRATE$REPO
      git checkout $BRANCH
      cd ..
      mv $AUTHOR$ATRATE$REPO $AUTHOR$ATRATE$REPO$SP$BRANCH
fi
