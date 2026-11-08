package com.MinhaColheita.backend.services; // Ajuste para o seu pacote
import com.MinhaColheita.backend.socket.Servidor;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Service
public class SocketInitializationService {

    // A anotação @PostConstruct faz o Spring executar esse método automaticamente ao ligar
    @PostConstruct
    public void initSocketServer() {
        System.out.println("Iniciando o servidor de Sockets do professor Maligno em uma nova Thread...");

        // Criamos uma nova Thread (linha de execução) para não travar a API REST
        Thread socketThread = new Thread(() -> {
            try {
                // Aqui chamamos o método principal da classe Servidor do seu professor.
                // Assumindo que a classe Servidor dele tenha o método tradicional "public static void main"
                Servidor.main(new String[]{});
            } catch (Exception e) {
                System.out.println("Erro ao iniciar o servidor de Sockets: " + e.getMessage());
                e.printStackTrace();
            }
        });

        // Dá o play na Thread
        socketThread.start();
    }
}