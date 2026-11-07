//Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import java.io.*;

public class Teclado
{
    private static BufferedReader teclado = new BufferedReader (
                                            new InputStreamReader (
                                            System.in));

    public static String getUmString ()
    {
        String ret=null;
        try
        {
            ret = teclado.readLine ();
        }
        catch (IOException erro)
        {}
        return ret;
    }

    public static byte getUmByte () throws Exception
    {
        byte ret=(byte)0;
        try
        {
            ret = Byte.parseByte (teclado.readLine ());
        }
        catch (IOException erro)
        {}
        catch (NumberFormatException erro)
        {
            throw new Exception ("Byte invalido!");
        }
        return ret;
    }

    public static short getUmShort () throws Exception
    {
        short ret=(short)0;
        try
        {
            ret = Short.parseShort (teclado.readLine ());
        }
        catch (IOException erro)
        {}
        catch (NumberFormatException erro)
        {
            throw new Exception ("Short invalido!");
        }
        return ret;
    }

    public static int getUmInt () throws Exception
    {
        int ret=0;
        try
        {
            ret = Integer.parseInt (teclado.readLine ());
        }
        catch (IOException erro)
        {}
        catch (NumberFormatException erro)
        {
            throw new Exception ("Int invalido!");
        }
        return ret;
    }

    public static long getUmLong () throws Exception
    {
        long ret=0L;
        try
        {
            ret = Long.parseLong (teclado.readLine ());
        }
        catch (IOException erro)
        {}
        catch (NumberFormatException erro)
        {
            throw new Exception ("Long invalido!");
        }
        return ret;
    }
}