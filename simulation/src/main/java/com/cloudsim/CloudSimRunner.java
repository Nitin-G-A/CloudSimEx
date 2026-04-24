package com.cloudsim;

import org.cloudbus.cloudsim.brokers.DatacenterBrokerSimple;
import org.cloudsimplus.builders.tables.CloudletsTableBuilder;
import org.cloudbus.cloudsim.cloudlets.Cloudlet;
import org.cloudbus.cloudsim.cloudlets.CloudletSimple;
import org.cloudbus.cloudsim.core.CloudSim;
import org.cloudbus.cloudsim.datacenters.DatacenterSimple;
import org.cloudbus.cloudsim.hosts.Host;
import org.cloudbus.cloudsim.hosts.HostSimple;
import org.cloudbus.cloudsim.resources.Pe;
import org.cloudbus.cloudsim.resources.PeSimple;
import org.cloudbus.cloudsim.utilizationmodels.UtilizationModelDynamic;
import org.cloudbus.cloudsim.vms.Vm;
import org.cloudbus.cloudsim.vms.VmSimple;
import org.cloudbus.cloudsim.allocationpolicies.VmAllocationPolicyBestFit;
import org.cloudbus.cloudsim.schedulers.cloudlet.CloudletSchedulerTimeShared;
import org.cloudbus.cloudsim.schedulers.cloudlet.CloudletSchedulerSpaceShared;

import java.io.FileWriter;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;


public class CloudSimRunner {

    // Simulation parameters (set from args or use defaults)
    private int    numVMs           = 3;
    private int    numCloudlets     = 10;
    private long   vmMips           = 1000;
    private long   vmRam            = 2048;  
    private long   vmBw             = 1000;  
    private long   cloudletLength   = 10000;  
    private String schedulingPolicy = "TimeShared";
    private String outputPath       = "./output/results.csv";

    //  Host config (fixed, sensible defaults)
    private final int  HOST_PES  = 8;
    private final long HOST_MIPS = 10000;
    private final long HOST_RAM  = 16384;  // 16 GB
    private final long HOST_BW   = 10000;
    private final long HOST_STORAGE = 1_000_000; // 1 TB

    public static void main(String[] args) {
        CloudSimRunner runner = new CloudSimRunner();
        runner.parseArgs(args);
        runner.run();
    }

    private void parseArgs(String[] args) {
        if (args.length >= 8) {
            try {
                numVMs           = Integer.parseInt(args[0]);
                numCloudlets     = Integer.parseInt(args[1]);
                vmMips           = Long.parseLong(args[2]);
                vmRam            = Long.parseLong(args[3]);
                vmBw             = Long.parseLong(args[4]);
                cloudletLength   = Long.parseLong(args[5]);
                schedulingPolicy = args[6];
                outputPath       = args[7];
            } catch (NumberFormatException e) {
                System.err.println("[WARN] Bad args, using defaults. Error: " + e.getMessage());
            }
        } else {
            System.out.println("[INFO] No args provided, using default config.");
        }

        // Print final config
        System.out.println("=== Simulation Config ===");
        System.out.println("VMs           : " + numVMs);
        System.out.println("Cloudlets     : " + numCloudlets);
        System.out.println("VM MIPS       : " + vmMips);
        System.out.println("VM RAM (MB)   : " + vmRam);
        System.out.println("VM BW (Mbps)  : " + vmBw);
        System.out.println("Cloudlet Len  : " + cloudletLength + " MI");
        System.out.println("Scheduling    : " + schedulingPolicy);
        System.out.println("Output        : " + outputPath);
        System.out.println("=========================");
    }

    private void run() {
        // 1. Initialize CloudSim Plus
        CloudSim simulation = new CloudSim();

        // 2. Create Datacenter with enough hosts
        createDatacenter(simulation);

        // 3. Create Broker (manages VM/cloudlet submission)
        DatacenterBrokerSimple broker = new DatacenterBrokerSimple(simulation);

        // 4. Create VMs
        List<Vm> vmList = createVMs();
        broker.submitVmList(vmList);

        // 5. Create Cloudlets (tasks)
        List<Cloudlet> cloudletList = createCloudlets();
        broker.submitCloudletList(cloudletList);

        // 6. Start simulation
        System.out.println("\n>>> Starting simulation...\n");
        simulation.start();

        // 7. Collect finished cloudlets
        List<Cloudlet> finishedCloudlets = broker.getCloudletFinishedList();

        // 8. Print table to console
        new CloudletsTableBuilder(finishedCloudlets).build();

        // 9. Save results to CSV
        saveResultsToCSV(finishedCloudlets);

        System.out.println("\n>>> Simulation complete! Results saved to: " + outputPath);
    }

    private DatacenterSimple createDatacenter(CloudSim simulation) {
        // Create enough hosts to accommodate all VMs
        int numHosts = Math.max(2, (int) Math.ceil((double) numVMs / HOST_PES));
        List<Host> hostList = new ArrayList<>();

        for (int i = 0; i < numHosts; i++) {
            List<Pe> peList = new ArrayList<>();
            for (int j = 0; j < HOST_PES; j++) {
                peList.add(new PeSimple(HOST_MIPS));
            }
            hostList.add(new HostSimple(HOST_RAM, HOST_BW, HOST_STORAGE, peList));
        }

        return new DatacenterSimple(simulation, hostList, new VmAllocationPolicyBestFit());
    }

    private List<Vm> createVMs() {
        List<Vm> list = new ArrayList<>();
        for (int i = 0; i < numVMs; i++) {
            Vm vm;
            if ("SpaceShared".equalsIgnoreCase(schedulingPolicy)) {
                vm = new VmSimple(vmMips, 2, new CloudletSchedulerSpaceShared());
            } else {
                vm = new VmSimple(vmMips, 2, new CloudletSchedulerTimeShared());
            }
            vm.setRam(vmRam).setBw(vmBw).setSize(10_000);
            list.add(vm);
        }
        return list;
    }

    private List<Cloudlet> createCloudlets() {
        List<Cloudlet> list = new ArrayList<>();
        UtilizationModelDynamic utilization = new UtilizationModelDynamic(0.5);

        for (int i = 0; i < numCloudlets; i++) {
            // Add slight variation to cloudlet lengths so results are interesting
            long length = cloudletLength + (long)(Math.random() * cloudletLength * 0.5);
            Cloudlet cloudlet = new CloudletSimple(length, 2, utilization);
            cloudlet.setSizes(1024); // 1 KB input/output
            list.add(cloudlet);
        }
        return list;
    }

    private void saveResultsToCSV(List<Cloudlet> cloudlets) {
        // Make sure output directory exists
        java.io.File outputDir = new java.io.File(outputPath).getParentFile();
        if (outputDir != null && !outputDir.exists()) {
            outputDir.mkdirs();
        }

        try (PrintWriter pw = new PrintWriter(new FileWriter(outputPath))) {
            // Header
            pw.println("cloudlet_id,vm_id,status,exec_time,start_time,finish_time,length,cpu_cores");

            // Data rows
            for (Cloudlet c : cloudlets) {
                pw.printf("%d,%d,%s,%.4f,%.4f,%.4f,%d,%d%n",
                    c.getId(),
                    c.getVm().getId(),
                    c.getStatus().name(),
                    c.getActualCpuTime(),
                    c.getExecStartTime(),
                    c.getFinishTime(),
                    c.getLength(),
                    c.getNumberOfPes()
                );
            }

            System.out.println("[CSV] Written " + cloudlets.size() + " rows to " + outputPath);

        } catch (Exception e) {
            System.err.println("[ERROR] Could not write CSV: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
