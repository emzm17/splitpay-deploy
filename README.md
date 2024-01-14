# Splitpay 
Splitpay is a collaborative finance management application designed to streamline the process of splitting and settling expenses among a group of users. The platform allows users to create groups, add expenses, and keep track of who owes whom.


## Table of Contents

- [Installation](#installation)
- [Requirement](#requirement)
- [Run](#run)
- [API](#api)


## Install

    git clone https://github.com/emzm17/splitpay-backend.git
    cd splitpay-backend/

## Requirement
      
- Mysql Database
- Redis server
- Secret Key
  

    
## API

#### `/users`
* `GET` : Get all Users.
#### `/users/signup`
* `POST` : Create new user.
#### `/users/signin`
* `POST` : Login as User.
#### `/users/groups`
* `GET` : Get all groups current user member.
#### `groups/create`
* `POST` : Create group.
#### `groups/:id`
* `GET` : Get expense of that group.
#### `/expenses`
* `GET` : Get all Expenses.
#### `/expenses/:id`
* `GET` : Get all expense of that group.
#### `/expenses/create`
* `POST` : Create expense.
#### `/settlement/:id`
* `GET` : Get settle the expenses.
  
  
  
   
   
   
  
  
  
 
 
    




  
