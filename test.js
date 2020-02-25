/* global describe, it  */
var assert = require('assert');
var knex = require('knex')({client: 'pg' });
var knexJsonQuery = require('./');
require('simple-mocha');


var conditions= [
  /* -----------Tests for and conditions---------- */
  {
    name: 'handle simple and conditions',
    input:{ f1: 10, f2: 20, f3: 30 },
    output: 'select * where ("f1" = 10 and "f2" = 20 and "f3" = 30)'
  },
  {
    name: 'handle simple and conditions',
    input:{"firstName":[["like","H%"],["OR","hemanth"]]},
    output: 'select * where (("firstName" like \'H%\' or "firstName" = \'hemanth\'))'
  },
  {
    name: 'handle regex query: MongoQuery',
    input:{"firstName":{ $regex: "H*" }},
    output: 'select * where ("firstName" regexp \'H*\')'
  },
  {
    name: 'handle regex query and should omit $options: MongoQuery',
    input:{"firstName":{ $regex: "H*", $options: 'i' }},
    output: 'select * where ("firstName" regexp \'H*\')'
  },
  {
    name: 'handle simple and conditions',
    input:{ f1: [[ 'A' ],['like', 'B' ]], f2: 20, f3: 30 },
    output: 'select * where (("f1" = \'A\' and "f1" like \'B\') and "f2" = 20 and "f3" = 30)'
  },
  {
    name: 'handle basic operators :: greater-than less-than',
    input:{ f1: ['>', 10], f2: [ '<', 20 ], f3: 30 },
    output: 'select * where ("f1" > 10 and "f2" < 20 and "f3" = 30)'
  },
  {
    name: 'handle basic operators :: in',
    input:{ f1: ['IN', [10,50]], f2: [ '<', 20 ], f3: 30 },
    output: 'select * where ("f1" in (10, 50) and "f2" < 20 and "f3" = 30)'
  },
  {
    name: 'handle basic operators :: notin',
    input:{ f1: ['NOTIN', [10,50]], f2: [ '<', 20 ], f3: 30 },
    output: 'select * where ("f1" not in (10, 50) and "f2" < 20 and "f3" = 30)'
  },
  {
    name: 'handle multiple conditions in one field',
    input:{ f1: [ [ 'like', 20 ], 21, [ 'AND_BETWEEN', [ 40, 45 ] ] ], f2: 20, f3: 30 },
    output: 'select * where (("f1" like 20 and "f1" = 21 and "f1" between 40 and 45) and "f2" = 20 and "f3" = 30)'
  },
  {
    name: 'handle simple and condition with like statement',
    input:{ f1: [ 'like', 20 ], f2: 20, f3: 30 },
    output: 'select * where ("f1" like 20 and "f2" = 20 and "f3" = 30)'
  },
  {
    name: 'handle simple and condition with between statement',
    input:{ f1: ['BETWEEN', [50, 60] ], f2: 20, f3: 30 },
    output: 'select * where ("f1" between 50 and 60 and "f2" = 20 and "f3" = 30)'
  },
  {
    name: 'handle simple and condition with in statement',
    input:{ f1: ['IN', [ 50, 60 ] ], f2: 20, f3: 30 },
    output: 'select * where ("f1" in (50, 60) and "f2" = 20 and "f3" = 30)'
  },
  {
    name: 'handle simple and condition with not in statement',
    input:{ f1: ['NOTIN', [ 50, 60 ] ], f2: 20, f3: 30 },
    output: 'select * where ("f1" not in (50, 60) and "f2" = 20 and "f3" = 30)'
  },
  {
    name: 'handle simple and condition with raw statement',
    input: { f1: { $raw: '@> ANY(ARRAY(1,2,3))' }, f2: 20 },
    output: 'select * where ("f1" @> ANY(ARRAY(1,2,3)) and "f2" = 20)'
  },
  /* -----------Tests for or conditions---------- */
  {
    name: 'handle $and grouping',
    input:{ f1: 10, f2: 20, f3: 30, $and: [ { f4: 55 }, { f5: 66} ] },
    output: 'select * where ("f1" = 10 and "f2" = 20 and "f3" = 30 and (("f4" = 55) or ("f5" = 66)))'
  },
  /* -----------Tests for or conditoins---------- */
  {
    name: 'handle simple or condition',
    input:[ { f1: 10 }, { f2: 20 }, { f3: 30 } ],
    output: 'select * where (("f1" = 10) or ("f2" = 20) or ("f3" = 30))'
  },
  {
    name: 'handle multiple conditions in one field',
    input:{ f1: [ [ 'like', 20 ], [ 'OR', 21 ], [ 'OR_BETWEEN', [ 40, 45 ] ] ], f2: 20, f3: 30 },
    output: 'select * where (("f1" like 20 or "f1" = 21 or "f1" between 40 and 45) and "f2" = 20 and "f3" = 30)'
  },
  {
    name: 'handle multiple conditions in one field: MongoQuery',
    input:{ f1: { $like: 20, $or: 21, $or_between: [ 40, 45 ] }, f2: 20, f3: 30 },
    output: 'select * where (("f1" like 20 or "f1" = 21 or "f1" between 40 and 45) and "f2" = 20 and "f3" = 30)'
  },
  {
    name: 'handle simple or condition with like statement',
    input:[ { f1: ['like',10] }, { f2: 20 }, { f3: 30 } ],
    output: 'select * where (("f1" like 10) or ("f2" = 20) or ("f3" = 30))'
  },
  {
    name: 'handle simple or condition with like statement: MongoQuery',
    input:[ { f1: { $like: 10 } }, { f2: 20 }, { f3: 30 } ],
    output: 'select * where (("f1" like 10) or ("f2" = 20) or ("f3" = 30))'
  },
  {
    name: 'handle simple or condition with between statement',
    input:[ { f1: ['BETWEEN',[50, 60] ] }, { f2: 20 }, { f3: 30 } ],
    output: 'select * where (("f1" between 50 and 60) or ("f2" = 20) or ("f3" = 30))'
  },
  {
    name: 'handle simple or condition with between statement :MongoQuery',
    input:[ { f1: { $between:[50, 60] } }, { f2: 20 }, { f3: 30 } ],
    output: 'select * where (("f1" between 50 and 60) or ("f2" = 20) or ("f3" = 30))'
  },
  {
    name: 'handle simple or condition with in statement',
    input:[ { f1: ['IN',[ 50, 60 ]] }, { f2: 20 }, { f3: 30 } ],
    output: 'select * where (("f1" in (50, 60)) or ("f2" = 20) or ("f3" = 30))'
  },
  {
    name: 'handle simple or condition with not in statement',
    input:[ { f1: ['NOTIN',[ 50, 60 ]] }, { f2: 20 }, { f3: 30 } ],
    output: 'select * where (("f1" not in (50, 60)) or ("f2" = 20) or ("f3" = 30))'
  },
  {
    name: 'handle simple or condition with in statement :MongoQuery',
    input:[ { f1: {$in:[ 50, 60 ]} }, { f2: 20 }, { f3: 30 } ],
    output: 'select * where (("f1" in (50, 60)) or ("f2" = 20) or ("f3" = 30))'
  },
  {
    name: 'handle simple or condition with nin statement :MongoQuery',
    input:[ { f1: { $nin: [ 50, 60 ] } }, { f2: 20 }, { f3: 30 } ],
    output: 'select * where (("f1" not in (50, 60)) or ("f2" = 20) or ("f3" = 30))'
  },
  {
    name: 'handle simple or condition with raw statement',
    input: [ { f1: { $raw: '@> ANY(ARRAY(1,2,3))' } }, { f2: 20 } ],
    output: 'select * where (("f1" @> ANY(ARRAY(1,2,3))) or ("f2" = 20))'
  },
  {
    name: 'handle simple or condition with conditional array',
    input: { f1: [['ilike', 'awesome'], ['OR_ilike', '%super%'] ] },
    output: 'select * where (("f1" ilike \'awesome\' or "f1" ilike \'%super%\'))'
  },
  {
    name: 'handle $or grouping',
    input:{ f1: 10, f2: 20, f3: 30, $or: [ { f4: 55 }, { f5: 66} ] },
    output: 'select * where ("f1" = 10 and "f2" = 20 and "f3" = 30 or (("f4" = 55) or ("f5" = 66)))'
  },
];


describe('SQL query generation from json query', function(){
  conditions.forEach(function(v){
    it( 'should ' + v.name , function(){
      var expectedOut = knex.where( knexJsonQuery(v.input) ) + '';
      assert.equal( v.output, expectedOut );
    });
  });
});

