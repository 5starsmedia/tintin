# acl-js

acl-js is a node.js access control list implementation.

## Example

```javascript
var aclData = {
    '_id': {
        'get': ['user', 'admin']
    },
    'account.login': {
        'get': ['admin', '*:owner'],
        'get?_id': ['admin', '*:owner'],
        'put': ['admin'],
        'post': 'admin'
    },
    'account.profile': {
        'get?id': ['admin', 'user'],
    },
    'password': false,
    'salt': false,
    '*': {
        'get': ['admin', '*:owner'],
        'put': '*:owner',
        'post': 'admin',
        'delete': 'admin'
    }
};

var modelFields = ['_id', 'account.login', 'account.profile', 'password', 'salt'];

var data = acl.compareAcl(modelFields, aclData, {
    roles: 'user',
    method: 'get',
    params: ['_id'],
    modifiers: ['owner'],
    fields: ['account.title']
});

/*
data: {
    fields: ['account.title'],
    hasAccess: true,
    deniedFields: []
}
*/
```
