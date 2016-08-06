var list = function (e) {
    this.first = null;
    this.last = null;
};

list.prototype.remove = function (value) {
    var found = false;
    var current = this.first,
        prev;
    while (current != null) {
        if (this.first.value == value) {
            prev = current = this.first = this.first.next;
            found = true;
        } else {
            if (current.value == value) {
                found = true;
                prev.next = current.next;
            }
            prev = current;
            current = current.next;                            
        }
    }

    if (!found) {
        console.log("#" + value + " not found");
    }
}

list.prototype.show = function () {
    var next = this.first;
    while (next != null) {
        console.log(next.value);
        next = next.next;
    }
}

list.prototype.update = function (value, newValue) {
    var head = this.first;
    while (head != null) {
        if (head.value == value) {
            head.value = newValue;
        }
        head = head.next;
    }
}

list.prototype.next = function(){
    var node = this.first;
    this.first = this.first.next;
    node.next = null;
    return node;
};

list.prototype.add = function (value) {
    var node = {
        value: value,
    };

    if (this.first) {
        this.last.next = node;
        this.last = node;
    } else {
        this.first = this.last = node;
    }

    //console.log('first', this.first);
}

var list = new list();
list.add(1);
list.add(2);
list.add(3);
list.add(4);

list.show();
//process.exit();
console.log("____________________________");

list.update(2, 5);           
list.show();
console.log("____________________________");

list.remove(3);
list.show();
var ele = list.next();
console.log("____________________________");
list.show();
console.log("____________________________");
console.log("ele", ele);

