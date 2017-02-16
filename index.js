


var functionOperatorMap = {
  BETWEEN: 'whereBetween',
  IN: 'whereIn',
  ISNULL: 'whereNull',
  NOTNULL: 'whereNotNull',
  /* ---- */
  OR: 'orWhere',
  AND: 'where',
  EQ: 'where',
  '=': 'where',
  /* ---- */
  OR_BETWEEN: 'orWhereBetween',
  OR_IN: 'orWhereIn',
  OR_ISNULL: 'orWhereNull',
  IR_NOTNULL: 'orWhereNotNull',
  /* ---- */
  AND_BETWEEN: 'andWhereBetween',
  AND_IN: 'andWhereIn',
  AND_ISNULL: 'andWhereNull',
  AND_NOTNULL: 'andWhereNotNull',
};



function addCondition (q, field, val) {
  if (Array.isArray(val[0])) {
    return q.where(function () {
      return val.forEach(addCondition.bind(null, this, field));
    });
  }
  
  if (!Array.isArray(val)) {
    val = ['AND', field, val ];
  } else if (functionOperatorMap.hasOwnProperty( val[0] ) ) {
    val = [ val[0], field ].concat(val.slice(1));
  } else {
    val = [ 'AND', field ].concat(val);
  }

  return q[functionOperatorMap[val[0]]].apply(q, val.slice(1));
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
