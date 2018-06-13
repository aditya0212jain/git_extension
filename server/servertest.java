import java.net.*;
import java.io.*;

class servertest{
  public static void main(String[] args) {
    try{
      ServerSocket server = new ServerSocket(3000);
      Socket s = server.accept();
      System.out.println("connected");

      DataOutputStream dos = new DataOutputStream(s.getOutputStream());
      dos.writeUTF("welcome to server");


    } catch(Exception e){}

  }
}
