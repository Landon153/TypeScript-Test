var Vehicle = /** @class */ (function () {
    function Vehicle(name, brand) {
        this.name = name;
        this.brand = brand;
    }
    Vehicle.prototype.info = function () {
        return "Name: " + this.name + ", brand: " + this.brand;
    };
    Vehicle.prototype.start = function () {
        return this.brand + " " + this.name + " is runing.";
    };
    return Vehicle;
}());
var bugati = new Vehicle("Veyon", "Bugati");
bugati.start();
