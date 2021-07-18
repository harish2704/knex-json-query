"use strict";

var functionOperatorMap = {
  BETWEEN: 'whereBetween',
  IN: 'whereIn',
  NIN: 'whereNotIn',
  NOTIN: 'whereNotIn',
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
  OR_NOTIN: 'orWhereNotIn',
  OR_ISNULL: 'orWhereNull',
  IR_NOTNULL: 'orWhereNotNull',
  /* ---- */
  AND_BETWEEN: 'andWhereBetween',
  AND_IN: 'andWhereIn',
  AND_NOTIN: 'andWhereNotIn',
  AND_ISNULL: 'andWhereNull',
  AND_NOTNULL: 'andWhereNotNull',
  /* ---- */
  RAW: 'whereRaw',
  OR_RAW: 'orWhereRaw',
  AND_RAW: 'whereRaw',
};

var aliases = {
  REGEX: 'REGEXP'
};



function addCondition (q, field, val) {
  if( field === '$or' ){
    return q.orWhere( getWhereCondition( val ))
  }
  if( field === '$and' ){
    return q.where( getWhereCondition( val ))
  }
  if( val.constructor.name === 'Object' ){
    delete val.$options;
    val = Object.keys(val).map( function(key){
      return [ key.slice(1).toUpperCase(), val[key] ];
    });
    if( val.length === 1){
      val = val[0];
    }
  }
  if (Array.isArray(val[0])) {
    return q.where(function () {
      return val.forEach(addCondition.bind(null, this, field));
    });
  }

  if (!Array.isArray(val)) {
    // Simple string or number value
    val = ['AND', field, val ];
  } else {
    val[0] = aliases[ val[0] ] || val[0];
    if (functionOperatorMap.hasOwnProperty( val[0] ) ) {
      // SQL operator
      val = [ val[0], field ].concat(val.slice(1));
    } else {
      // Cases when we have something like 'OR_ILIKE' or 'AND_@>'
      var operators = /(\w+)_(\w+)/.exec(val[0])
      var operatorsExist = operators && operators.constructor === Array && operators.length >= 3
      if (operatorsExist) {
        val = [operators[1], field].concat([operators[2]], val.slice(1));
      } else {
        // other cases like ( '>', '10' ) Greater than 10
        val = [ 'AND', field ].concat(val);
      }
    }
  }
  var args = val[0].includes('RAW') ? [ q.client.raw('??', val[1]) + ' ' + val[2] ] : val.slice(1);
  return q[functionOperatorMap[val[0]]].apply(q, args);
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
