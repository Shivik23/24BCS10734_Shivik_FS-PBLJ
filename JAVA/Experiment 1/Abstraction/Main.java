package Abstraction;

abstract class Bank{
    private static int balance=1000;

    public  void getbalance(){
        System.out.println(balance);
    }
    public  void setBalance(int val){
        balance=val;
    }
}

class Sbi extends Bank{
    public static void debit(int bal){
        int currVal=super.balance;
        currVal-=bal;
        super.setBalance(currVal);
    }

    public static void credit(int bal){
        int currVal=super.balance;
        currVal+=bal;
        super.credit(currVal);

    }
}
public class Main {
    public static void main(String[] args) {

    }
}
