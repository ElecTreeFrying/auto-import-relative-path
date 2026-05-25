export class Calculator {
  constructor(initial = 0) {
    this.value = initial;
  }

  add(operand) {
    this.value += operand;
    return this;
  }

  subtract(operand) {
    this.value -= operand;
    return this;
  }

  reset() {
    this.value = 0;
    return this;
  }
}

export function createCalculator(initial) {
  return new Calculator(initial);
}
