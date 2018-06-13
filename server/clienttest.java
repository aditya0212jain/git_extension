import java.net.*;
import java.io.*;

class clienttest{
  public static void main(String[] args) {
    try{
    Socket s = new Socket("127.0.0.1",3000);
    //System.out.println("Connected to server");
    DataInputStream dis = new DataInputStream(s.getInputStream());

    String msg = dis.readUTF();

    System.out.println(msg);
  }catch(Exception e){}
    }
}
