


class Vehicle {
    name: string;
    brand: string;
    constructor (name: string, brand: string) {
        this.name = name;
        this.brand = brand;
    }

    info() {
      return "Name: " + this.name + ", brand: " + this.brand;
    }

    start() {
        return this.brand + " " + this.name + " is runing.";
    }
}

let bugati = new Vehicle("Veyon", "Bugati");
bugati.start();