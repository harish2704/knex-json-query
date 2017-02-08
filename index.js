
var simpleOperators = [
  'LIKE',
  '>',
  '<',
];

var functionOperators = [
  'BETWEEN',
  'IN'
];

var functionOperatorMap = {
  BETWEEN: 'whereBetween',
  IN: 'whereIn'
};



function addCondition( q, field, val ){
  var conditionFn, conditionName;
  if( !Array.isArray(val)){
    return q.where( field, val );
  }
  conditionName = val[0];
  if( simpleOperators.indexOf( conditionName ) !== -1 ){
    return q.where.apply(q, [field].concat(val) );
  }
  if( functionOperators.indexOf(conditionName) !== -1 ){
    return q[functionOperatorMap[conditionName] ]( field, val.slice(1) );
  }
}

function getWhereCondition( cond ){
  if( Array.isArray(cond) ){
    return function(){
      cond.forEach( function(v){
        this.orWhere( getWhereCondition(v) );
      }, this );
    };
  } else {
    return function(){
      var field;
      for( field in cond ){
        addCondition( this, field, cond[field] );
      }
    };
  }
}


module.exports = getWhereCondition;
