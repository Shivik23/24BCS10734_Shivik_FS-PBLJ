
class BankAccount{
    private  String accountNumber;
    private  double balance;
    
    public BankAccount(String accNumber,double amount){
        accountNumber=accNumber;
        balance=amount;
    }
    
    public  double getBalance(){
        return balance;
    }

        public  void setBalance(double amount){
            if(balance>=0){
                balance=amount;
            }
        }
        
    
    
    public  void deposit(double amount){
        balance+=amount;
    }
    
    public  void withdraw(double amount){
        if(balance-amount>=0){
            balance-=amount;
            System.out.println("balance withdrawn successfully");
        }else{
            System.out.println("Not sufficient balance");
        }
        
    }
    
    }

public class Main {
    public static void main(String[] args) {
      BankAccount b=new BankAccount("122365478",1000);
      b.deposit(100.50);
      b.withdraw(200.80);
      b.withdraw(900);
      System.out.println(b.getBalance());

    
       
       
    }
}
