using { miyasuta.media as db } from '../db/data-model';

service Attachments {
    entity Files as projection on db.Files;

    entity EMPLOYEE as projection on db.EMPLOYEE;

    function unBoundedFunc(ID:String) returns String;
   // action updateEmployee( file: Files:ID ) returns String;
}