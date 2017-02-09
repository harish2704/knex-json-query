

var functionOperators = [
  'BETWEEN',
  'IN',
  /* ---- */
  'OR',
  'AND',
  /* ---- */
  'OR_BETWEEN',
  'OR_IN',
  /* ---- */
  'AND_BETWEEN',
  'AND_IN'
];

var functionOperatorMap = {
  BETWEEN: 'whereBetween',
  IN: 'whereIn',
  /* ---- */
  OR: 'orWhere',
  AND: 'where',
  /* ---- */
  OR_BETWEEN: 'orWhereBetween',
  OR_IN: 'orWhereIn',
  /* ---- */
  AND_BETWEEN: 'andWhereBetween',
  AND_IN: 'andWhereIn'
};



function addCondition (q, field, val) {
  if (Array.isArray(val[0])) {
    return q.where(function () {
      return val.forEach(addCondition.bind(null, this, field))
    })
  }
  
  if (!Array.isArray(val)) {
    val = ['AND', field, val ]
  } else if (functionOperators.indexOf(val[0]) !== -1) {
    val.splice(1, 0, field)
  } else {
    val = [ 'AND', field ].concat(val)
  }

  return q[functionOperatorMap[val[0]]].apply(q, val.slice(1))
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
