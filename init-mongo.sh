read -p "Would You like to initialize database as defaulf admin (data will be erased)? (y/N) " decision
if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
  exit
fi
read -p "Do yo want to initialize db on a mongo URL location? if not it will run as docker container (y/N) " decision
if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
  exit
fi
echo "######\t Loading ENV variables \t######"
export $(grep -v '^#' config/.env/.production | xargs)
echo "varaible DB_URI: \t\t$DB_URI"
echo "variable MONGO_DB_NAME: \t$MONGO_DB_NAME"
echo "Be sure to secret key and password  admin use bcryptjs and are hashable, admin password is in init-mongo.js"
mongo $DB_URI --eval "DB_URI = '$DB_URI'; MONGO_DB_NAME = '$MONGO_DB_NAME';"  init-mongo.js
