ARG=$(node argShellPull.js)
ARG1=($ARG)
WORKINGFOLDER=${ARG1[0]}
SERVERFOLDER=${ARG1[1]}
REPO=${ARG1[2]}
BRANCH1=${ARG1[3]}
BRANCH2=${ARG1[4]}
SP="_"
rm -r -f $SERVERFOLDER/$REPO*
cp -r $WORKINGFOLDER/$REPO $SERVERFOLDER
cd $SERVERFOLDER/$REPO
git checkout $BRANCH2
cd ..
mv $REPO $REPO$SP$BRANCH2
cp -r $WORKINGFOLDER/$REPO $SERVERFOLDER
cd $SERVERFOLDER/$REPO
git checkout $BRANCH1
cd ..
mv $REPO $REPO$SP$BRANCH1
echo pullDone