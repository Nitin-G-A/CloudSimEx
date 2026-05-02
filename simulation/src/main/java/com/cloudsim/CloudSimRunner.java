package com.cloudsim;

import org.cloudbus.cloudsim.brokers.DatacenterBrokerSimple;
import org.cloudbus.cloudsim.cloudlets.Cloudlet;
import org.cloudbus.cloudsim.cloudlets.CloudletSimple;
import org.cloudbus.cloudsim.core.CloudSim;
import org.cloudbus.cloudsim.datacenters.DatacenterSimple;
import org.cloudbus.cloudsim.hosts.Host;
import org.cloudbus.cloudsim.hosts.HostSimple;
import org.cloudbus.cloudsim.resources.Pe;
import org.cloudbus.cloudsim.resources.PeSimple;
import org.cloudbus.cloudsim.utilizationmodels.UtilizationModelFull;
import org.cloudbus.cloudsim.vms.Vm;
import org.cloudbus.cloudsim.vms.VmSimple;
import org.cloudbus.cloudsim.allocationpolicies.VmAllocationPolicyBestFit;
import org.cloudbus.cloudsim.schedulers.cloudlet.CloudletSchedulerTimeShared;
import org.cloudbus.cloudsim.schedulers.cloudlet.CloudletSchedulerSpaceShared;

import java.io.FileWriter;
import java.io.PrintWriter;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.List;

public class CloudSimRunner {

    private int    numVMs          = 3;
    private int    numCloudlets    = 10;
    private long   vmMips          = 1000;
    private long   vmRam           = 2048;
    private long   vmBw            = 1000;
    private long   cloudletLength  = 10000;
    private String schedulingPolicy = "TimeShared";
    private String outputPath      = "./output/results.csv";

    private final int  HOST_PES     = 16;
    private final long HOST_MIPS    = 100000;
    private final long HOST_RAM     = 65536;
    private final long HOST_BW      = 100000;
    private final long HOST_STORAGE = 10_000_000;

    public static void main(String[] args) {
        CloudSimRunner runner = new CloudSimRunner();
        runner.parseArgs(args);
        runner.run();
    }

    private void parseArgs(String[] args) {
        if (args.length >= 8) {
            try {
                numVMs          = Integer.parseInt(args[0]);
                numCloudlets    = Integer.parseInt(args[1]);
                vmMips          = Long.parseLong(args[2]);
                vmRam           = Long.parseLong(args[3]);
                vmBw            = Long.parseLong(args[4]);
                cloudletLength  = Long.parseLong(args[5]);
                schedulingPolicy = args[6];
                outputPath      = args[7];
            } catch (NumberFormatException e) {
                System.err.println("[WARN] Bad args, using defaults.");
            }
        }
        System.out.println("=== Simulation Config ===");
        System.out.println("VMs          : " + numVMs);
        System.out.println("Cloudlets    : " + numCloudlets);
        System.out.println("MIPS/VM      : " + vmMips);
        System.out.println("RAM/VM (MB)  : " + vmRam);
        System.out.println("Scheduling   : " + schedulingPolicy);
        System.out.println("=========================");
    }

    private void run() {
        // ── Suppress CloudSim's internal WARN/INFO noise ──────────────────
        PrintStream originalErr = System.err;
        System.setErr(new PrintStream(new OutputStream() {
            public void write(int b) {}
        }));

        CloudSim simulation = new CloudSim();

        // Restore stderr after init so we still see real errors
        System.setErr(originalErr);

        DatacenterSimple datacenter = createDatacenter(simulation);
        DatacenterBrokerSimple broker = new DatacenterBrokerSimple(simulation);

        List<Vm> vmList = createVMs();
        broker.submitVmList(vmList);

        List<Cloudlet> cloudletList = createCloudlets();
        broker.submitCloudletList(cloudletList);

        System.out.println("\n>>> Starting simulation...\n");

        // Suppress all output during simulation run (removes WARN spam)
        PrintStream origOut = System.out;
        System.setOut(new PrintStream(new OutputStream() { public void write(int b) {} }));
        System.setErr(new PrintStream(new OutputStream() { public void write(int b) {} }));

        simulation.start();

        // Restore output
        System.setOut(origOut);
        System.setErr(originalErr);

        List<Cloudlet> finished = broker.getCloudletFinishedList();

        System.out.println(">>> Simulation complete!\n");
        printSimpleTable(finished);
        saveResultsToCSV(finished);

        System.out.println("\n>>> Results saved to: " + outputPath);
    }

    private DatacenterSimple createDatacenter(CloudSim simulation) {
        // Generous host config so no RAM/BW warnings occur
        int numHosts = Math.max(3, numVMs);
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
        for (int i = 0; i < numCloudlets; i++) {
            long length = cloudletLength + (long)(Math.random() * cloudletLength * 0.3);
            Cloudlet cloudlet = new CloudletSimple(length, 2, new UtilizationModelFull());
            cloudlet.setSizes(1024);
            list.add(cloudlet);
        }
        return list;
    }

    private void printSimpleTable(List<Cloudlet> cloudlets) {
        System.out.println("┌────────┬──────┬─────────┬───────────┬──────────┬──────────┐");
        System.out.println("│ CL ID  │ VM   │ STATUS  │ START (s) │ END (s)  │ EXEC (s) │");
        System.out.println("├────────┼──────┼─────────┼───────────┼──────────┼──────────┤");
        for (Cloudlet c : cloudlets) {
            System.out.printf("│ %-6d │ VM%-2d │ %-7s │ %-9.1f │ %-8.1f │ %-8.1f │%n",
                c.getId(), c.getVm().getId(), c.getStatus().name(),
                c.getExecStartTime(), c.getFinishTime(), c.getActualCpuTime());
        }
        System.out.println("└────────┴──────┴─────────┴───────────┴──────────┴──────────┘");
    }

    private void saveResultsToCSV(List<Cloudlet> cloudlets) {
        java.io.File outputDir = new java.io.File(outputPath).getParentFile();
        if (outputDir != null && !outputDir.exists()) outputDir.mkdirs();

        try (PrintWriter pw = new PrintWriter(new FileWriter(outputPath))) {
            pw.println("cloudlet_id,vm_id,status,exec_time,start_time,finish_time,length,cpu_cores");
            for (Cloudlet c : cloudlets) {
                pw.printf("%d,%d,%s,%.4f,%.4f,%.4f,%d,%d%n",
                    c.getId(), c.getVm().getId(), c.getStatus().name(),
                    c.getActualCpuTime(), c.getExecStartTime(), c.getFinishTime(),
                    c.getLength(), c.getNumberOfPes());
            }
            System.out.println("[CSV] " + cloudlets.size() + " rows saved.");
        } catch (Exception e) {
            System.err.println("[ERROR] CSV write failed: " + e.getMessage());
        }
    }
}
