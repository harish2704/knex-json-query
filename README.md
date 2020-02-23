[![Build Status](https://travis-ci.org/harish2704/knex-json-query.svg?branch=master)](https://travis-ci.org/harish2704/knex-json-query)
# knex-json-query
A high-level utility which will will generate Knex query from a single JSON object.

it is a simple function with just ~80 lines of code.

## Usage

```javascript
var knex = require('knex');
//var KnexJsonQuery = require('knex-json-query');
var KnexJsonQuery = require('./');
var jsonInput = {f1:{ $like: 'test%' }, $and: [{f2:22, f3: 33}] };
var queryBuilderFunction = KnexJsonQuery( jsonInput );

var sql = knex.where( queryBuilderFunction ).toString()
console.log( sql );

```

**Output**
```
select * where ("f1" LIKE 'test%' and (("f2" = 22 and "f3" = 33)))
```

## Examples

For more details, see the [test.js](./test.js)

**Examples from Unit test file:**

1. simple and conditions
    - *input JSON*: `{"f1":10,"f2":20,"f3":30}`
    - *output SQL*: `select * where ("f1" = 10 and "f2" = 20 and "f3" = 30)`

2. simple and conditions
    - *input JSON*: `{"firstName":[["LIKE","H%"],["OR","hemanth"]]}`
    - *output SQL*: `select * where (("firstName" LIKE 'H%' or "firstName" = 'hemanth'))`

3. regex query: MongoQuery
    - *input JSON*: `{"firstName":{"$regex":"H*"}}`
    - *output SQL*: `select * where ("firstName" REGEXP 'H*')`

4. regex query and should omit $options: MongoQuery
    - *input JSON*: `{"firstName":{"$regex":"H*","$options":"i"}}`
    - *output SQL*: `select * where ("firstName" REGEXP 'H*')`

5. simple and conditions
    - *input JSON*: `{"f1":[["A"],["LIKE","B"]],"f2":20,"f3":30}`
    - *output SQL*: `select * where (("f1" = 'A' and "f1" LIKE 'B') and "f2" = 20 and "f3" = 30)`

6. basic operators :: greater-than less-than
    - *input JSON*: `{"f1":[">",10],"f2":["<",20],"f3":30}`
    - *output SQL*: `select * where ("f1" > 10 and "f2" < 20 and "f3" = 30)`

7. basic operators :: in
    - *input JSON*: `{"f1":["IN",[10,50]],"f2":["<",20],"f3":30}`
    - *output SQL*: `select * where ("f1" in (10, 50) and "f2" < 20 and "f3" = 30)`

8. basic operators :: notin
    - *input JSON*: `{"f1":["NOTIN",[10,50]],"f2":["<",20],"f3":30}`
    - *output SQL*: `select * where ("f1" not in (10, 50) and "f2" < 20 and "f3" = 30)`

9. multiple conditions in one field
    - *input JSON*: `{"f1":[["LIKE",20],21,["AND_BETWEEN",[40,45]]],"f2":20,"f3":30}`
    - *output SQL*: `select * where (("f1" LIKE 20 and "f1" = 21 and "f1" between 40 and 45) and "f2" = 20 and "f3" = 30)`

10. simple and condition with like statement
    - *input JSON*: `{"f1":["LIKE",20],"f2":20,"f3":30}`
    - *output SQL*: `select * where ("f1" LIKE 20 and "f2" = 20 and "f3" = 30)`

11. simple and condition with between statement
    - *input JSON*: `{"f1":["BETWEEN",[50,60]],"f2":20,"f3":30}`
    - *output SQL*: `select * where ("f1" between 50 and 60 and "f2" = 20 and "f3" = 30)`

12. simple and condition with in statement
    - *input JSON*: `{"f1":["IN",[50,60]],"f2":20,"f3":30}`
    - *output SQL*: `select * where ("f1" in (50, 60) and "f2" = 20 and "f3" = 30)`

13. simple and condition with not in statement
    - *input JSON*: `{"f1":["NOTIN",[50,60]],"f2":20,"f3":30}`
    - *output SQL*: `select * where ("f1" not in (50, 60) and "f2" = 20 and "f3" = 30)`

14. simple and condition with raw statement
    - *input JSON*: `{"f1":{"$raw":"@> ANY(ARRAY(1,2,3))"},"f2":20}`
    - *output SQL*: `select * where ("f1" @> ANY(ARRAY(1,2,3)) and "f2" = 20)`

15. $and grouping
    - *input JSON*: `{"f1":10,"f2":20,"f3":30,"$and":[{"f4":55},{"f5":66}]}`
    - *output SQL*: `select * where ("f1" = 10 and "f2" = 20 and "f3" = 30 and (("f4" = 55) or ("f5" = 66)))`

16. simple or condition
    - *input JSON*: `[{"f1":10},{"f2":20},{"f3":30}]`
    - *output SQL*: `select * where (("f1" = 10) or ("f2" = 20) or ("f3" = 30))`

17. multiple conditions in one field
    - *input JSON*: `{"f1":[["LIKE",20],["OR",21],["OR_BETWEEN",[40,45]]],"f2":20,"f3":30}`
    - *output SQL*: `select * where (("f1" LIKE 20 or "f1" = 21 or "f1" between 40 and 45) and "f2" = 20 and "f3" = 30)`

18. multiple conditions in one field: MongoQuery
    - *input JSON*: `{"f1":{"$like":20,"$or":21,"$or_between":[40,45]},"f2":20,"f3":30}`
    - *output SQL*: `select * where (("f1" LIKE 20 or "f1" = 21 or "f1" between 40 and 45) and "f2" = 20 and "f3" = 30)`

19. simple or condition with like statement
    - *input JSON*: `[{"f1":["LIKE",10]},{"f2":20},{"f3":30}]`
    - *output SQL*: `select * where (("f1" LIKE 10) or ("f2" = 20) or ("f3" = 30))`

20. simple or condition with like statement: MongoQuery
    - *input JSON*: `[{"f1":{"$like":10}},{"f2":20},{"f3":30}]`
    - *output SQL*: `select * where (("f1" LIKE 10) or ("f2" = 20) or ("f3" = 30))`

21. simple or condition with between statement
    - *input JSON*: `[{"f1":["BETWEEN",[50,60]]},{"f2":20},{"f3":30}]`
    - *output SQL*: `select * where (("f1" between 50 and 60) or ("f2" = 20) or ("f3" = 30))`

22. simple or condition with between statement :MongoQuery
    - *input JSON*: `[{"f1":{"$between":[50,60]}},{"f2":20},{"f3":30}]`
    - *output SQL*: `select * where (("f1" between 50 and 60) or ("f2" = 20) or ("f3" = 30))`

23. simple or condition with in statement
    - *input JSON*: `[{"f1":["IN",[50,60]]},{"f2":20},{"f3":30}]`
    - *output SQL*: `select * where (("f1" in (50, 60)) or ("f2" = 20) or ("f3" = 30))`

24. simple or condition with not in statement
    - *input JSON*: `[{"f1":["NOTIN",[50,60]]},{"f2":20},{"f3":30}]`
    - *output SQL*: `select * where (("f1" not in (50, 60)) or ("f2" = 20) or ("f3" = 30))`

25. simple or condition with in statement :MongoQuery
    - *input JSON*: `[{"f1":{"$in":[50,60]}},{"f2":20},{"f3":30}]`
    - *output SQL*: `select * where (("f1" in (50, 60)) or ("f2" = 20) or ("f3" = 30))`

26. simple or condition with nin statement :MongoQuery
    - *input JSON*: `[{"f1":{"$nin":[50,60]}},{"f2":20},{"f3":30}]`
    - *output SQL*: `select * where (("f1" not in (50, 60)) or ("f2" = 20) or ("f3" = 30))`

27. simple or condition with raw statement
    - *input JSON*: `[{"f1":{"$raw":"@> ANY(ARRAY(1,2,3))"}},{"f2":20}]`
    - *output SQL*: `select * where (("f1" @> ANY(ARRAY(1,2,3))) or ("f2" = 20))`

28. simple or condition with conditional array
    - *input JSON*: `{"f1":[["ILIKE","awesome"],["OR_ILIKE","%super%"]]}`
    - *output SQL*: `select * where (("f1" ILIKE 'awesome' or "f1" ILIKE '%super%'))`

29. $or grouping
    - *input JSON*: `{"f1":10,"f2":20,"f3":30,"$or":[{"f4":55},{"f5":66}]}`
    - *output SQL*: `select * where ("f1" = 10 and "f2" = 20 and "f3" = 30 or (("f4" = 55) or ("f5" = 66)))`


