package com.MinhaColheita.backend.socket;

import java.io.*;
import java.net.*;
import java.util.*;

public class SupervisoraDeConexao extends Thread {
    private Parceiro usuario;
    private Socket conexao;
    private ArrayList<Parceiro> usuarios;

    public SupervisoraDeConexao(Socket conexao, ArrayList<Parceiro> usuarios) throws Exception {
        if (conexao == null) throw new Exception("Conexao ausente");
        if (usuarios == null) throw new Exception("Usuarios ausentes");

        this.conexao = conexao;
        this.usuarios = usuarios;
    }

    public void run() {
        ObjectOutputStream transmissor;
        try {
            transmissor = new ObjectOutputStream(this.conexao.getOutputStream());
        } catch (Exception erro) {
            return;
        }

        ObjectInputStream receptor = null;
        try {
            receptor = new ObjectInputStream(this.conexao.getInputStream());
        } catch (Exception erro) {
            try {
                transmissor.close();
            } catch (Exception falha) {}
            return;
        }

        try {
            this.usuario = new Parceiro(this.conexao, receptor, transmissor);
        } catch (Exception erro) {}

        try {
            synchronized (this.usuarios) {
                this.usuarios.add(this.usuario);
            }

            for (;;) {
                Comunicado comunicado = this.usuario.envie();

                if (comunicado == null) {
                    return;
                }
                else if (comunicado instanceof PedidoRegistroAplicacao) {
                    PedidoRegistroAplicacao pedido = (PedidoRegistroAplicacao) comunicado;

                    System.out.println("\n[SOCKET] Nova aplicação recebida do campo!");
                    System.out.println("Talhão: " + pedido.getIdTalhao());
                    System.out.println("Produto: " + pedido.getNomeProduto());
                    System.out.println("Data: " + pedido.getDataAplicacao());
                    System.out.println("Dosagem: " + pedido.getDosagem());

                    // TODO: Aqui vamos acionar o AplicacaoService do Spring Boot
                    // Ele vai:
                    // 1. Validar o produto no Agrofit
                    // 2. Calcular o período de carência
                    // 3. Salvar na coleção APLICACAO do MongoDB

                    // Opcional: Avisar o cliente que deu tudo certo
                    // this.usuario.receba(new ResultadoSucesso("Aplicação processada!"));
                }
                else if (comunicado instanceof PedidoParaSair) {
                    synchronized (this.usuarios) {
                        this.usuarios.remove(this.usuario);
                    }
                    this.usuario.adeus();
                }
            }
        } catch (Exception erro) {
            try {
                transmissor.close();
                receptor.close();
            } catch (Exception falha) {}
            return;
        }
    }
}