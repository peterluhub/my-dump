hash=$1
git filter-branch  --env-filter \
    'if [ $GIT_COMMIT = 1dd1cef4f64e2a13add24c7776a0e57d980097b4 ];then
        export GIT_AUTHOR_DATE="Fri Mar 4 19:03:21 2016 -0500"
        export GIT_COMMITTER_DATE="Fri Mar 4 19:03:21 2016 -0500"
    fi'
