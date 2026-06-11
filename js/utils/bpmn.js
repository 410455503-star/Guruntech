class BPMNEngine {
  constructor() {
    this.sequenceFlows = [];
    this.messageFlows = [];
    this.gateways = [];
  }

  addSequenceFlow(sourceTaskId, targetTaskId, type = 'FS', condition = null) {
    const flow = {
      id: `flow-${Date.now()}`,
      sourceTaskId,
      targetTaskId,
      type,
      condition,
      status: 'active'
    };
    this.sequenceFlows.push(flow);
    return flow;
  }

  removeSequenceFlow(flowId) {
    const index = this.sequenceFlows.findIndex(f => f.id === flowId);
    if (index !== -1) {
      return this.sequenceFlows.splice(index, 1)[0];
    }
    return null;
  }

  getOutgoingFlows(taskId) {
    return this.sequenceFlows.filter(f => f.sourceTaskId === taskId && f.status === 'active');
  }

  getIncomingFlows(taskId) {
    return this.sequenceFlows.filter(f => f.targetTaskId === taskId && f.status === 'active');
  }

  checkTaskCanStart(taskId, allTasks) {
    const incomingFlows = this.getIncomingFlows(taskId);
    const blockedBy = [];

    for (const flow of incomingFlows) {
      const sourceTask = allTasks.find(t => t.id === flow.sourceTaskId);
      if (!sourceTask) continue;

      const canProceed = this.checkFlowCondition(flow, sourceTask);
      if (!canProceed) {
        blockedBy.push({
          flowId: flow.id,
          sourceTaskId: flow.sourceTaskId,
          sourceTaskName: sourceTask.name,
          flowType: flow.type,
          reason: this.getBlockReason(flow, sourceTask)
        });
      }
    }

    return {
      canStart: blockedBy.length === 0,
      blockedBy
    };
  }

  checkFlowCondition(flow, sourceTask) {
    const sourceStatus = sourceTask.status;
    const flowType = flow.type;

    switch (flowType) {
      case 'FS':
        return sourceStatus === 'completed';
      case 'FF':
        return sourceStatus === 'completed';
      case 'SS':
        return sourceStatus === 'in_progress' || sourceStatus === 'completed';
      case 'SF':
        return sourceStatus === 'in_progress' || sourceStatus === 'completed';
      default:
        return true;
    }
  }

  getBlockReason(flow, sourceTask) {
    const flowTypeNames = {
      'FS': '完成-开始',
      'FF': '完成-完成',
      'SS': '开始-开始',
      'SF': '开始-完成'
    };

    const sourceStatusNames = {
      'todo': '待开始',
      'in_progress': '进行中',
      'paused': '已暂停',
      'completed': '已完成',
      'terminated': '已终止',
      'cancelled': '已取消'
    };

    const expectedStatus = flow.type === 'FS' || flow.type === 'FF' ? '已完成' : '已开始';
    const currentStatus = sourceStatusNames[sourceTask.status] || sourceTask.status;

    return `${flowTypeNames[flow.type]}依赖：前置任务"${sourceTask.name}"当前状态为"${currentStatus}"，需要"${expectedStatus}"`;
  }

  checkTaskCompletionImpact(taskId, allTasks) {
    const outgoingFlows = this.getOutgoingFlows(taskId);
    const impactedTasks = [];

    for (const flow of outgoingFlows) {
      const targetTask = allTasks.find(t => t.id === flow.targetTaskId);
      if (!targetTask) continue;

      if (targetTask.status === 'todo') {
        const canNowStart = this.checkTaskCanStart(targetTask.id, allTasks);
        if (canNowStart.canStart) {
          impactedTasks.push({
            taskId: targetTask.id,
            taskName: targetTask.name,
            flowId: flow.id,
            flowType: flow.type,
            action: 'unblock'
          });
        }
      }
    }

    return impactedTasks;
  }

  evaluateGateway(gatewayId, allTasks) {
    const gateway = this.gateways.find(g => g.id === gatewayId);
    if (!gateway) return null;

    switch (gateway.type) {
      case 'exclusive':
        return this.evaluateExclusiveGateway(gateway, allTasks);
      case 'parallel':
        return this.evaluateParallelGateway(gateway, allTasks);
      case 'inclusive':
        return this.evaluateInclusiveGateway(gateway, allTasks);
      default:
        return null;
    }
  }

  evaluateExclusiveGateway(gateway, allTasks) {
    const incomingFlows = this.sequenceFlows.filter(f => f.targetTaskId === gateway.id);
    
    for (const flow of incomingFlows) {
      const sourceTask = allTasks.find(t => t.id === flow.sourceTaskId);
      if (sourceTask && sourceTask.status === 'completed') {
        if (!flow.condition || this.evaluateCondition(flow.condition, sourceTask)) {
          const outgoingFlows = this.sequenceFlows.filter(f => f.sourceTaskId === gateway.id);
          return outgoingFlows[0]?.targetTaskId || null;
        }
      }
    }
    return null;
  }

  evaluateParallelGateway(gateway, allTasks) {
    const incomingFlows = this.sequenceFlows.filter(f => f.targetTaskId === gateway.id);
    const allCompleted = incomingFlows.every(flow => {
      const sourceTask = allTasks.find(t => t.id === flow.sourceTaskId);
      return sourceTask && sourceTask.status === 'completed';
    });

    if (allCompleted) {
      const outgoingFlows = this.sequenceFlows.filter(f => f.sourceTaskId === gateway.id);
      return outgoingFlows.map(f => f.targetTaskId);
    }
    return null;
  }

  evaluateInclusiveGateway(gateway, allTasks) {
    const incomingFlows = this.sequenceFlows.filter(f => f.targetTaskId === gateway.id);
    const completedSources = incomingFlows.filter(flow => {
      const sourceTask = allTasks.find(t => t.id === flow.sourceTaskId);
      return sourceTask && sourceTask.status === 'completed';
    });

    if (completedSources.length > 0) {
      const outgoingFlows = this.sequenceFlows.filter(f => f.sourceTaskId === gateway.id);
      return outgoingFlows.map(f => f.targetTaskId);
    }
    return null;
  }

  evaluateCondition(condition, task) {
    try {
      const context = {
        task,
        progress: task.progress || 0,
        status: task.status,
        isCompleted: task.status === 'completed',
        isOverdue: task.dueDate && new Date(task.dueDate) < new Date()
      };
      return new Function('ctx', `return ${condition}`)(context);
    } catch (e) {
      console.error('Condition evaluation error:', e);
      return false;
    }
  }

  exportBPMNXML() {
    const flowsXML = this.sequenceFlows.map(flow => `
      <sequenceFlow id="${flow.id}" sourceRef="${flow.sourceTaskId}" targetRef="${flow.targetTaskId}">
        ${flow.condition ? `<conditionExpression xsi:type="tFormalExpression">${flow.condition}</conditionExpression>` : ''}
      </sequenceFlow>
    `).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="project-process" isExecutable="true">
    ${flowsXML}
  </process>
</definitions>`;
  }

  importBPMNXML(xml) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const flows = doc.querySelectorAll('sequenceFlow');
      
      flows.forEach(flow => {
        const sourceRef = flow.getAttribute('sourceRef');
        const targetRef = flow.getAttribute('targetRef');
        const conditionExpr = flow.querySelector('conditionExpression');
        const condition = conditionExpr ? conditionExpr.textContent : null;
        
        this.addSequenceFlow(sourceRef, targetRef, 'FS', condition);
      });
      return true;
    } catch (e) {
      console.error('BPMN XML import error:', e);
      return false;
    }
  }
}

const bpmnEngine = new BPMNEngine();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BPMNEngine, bpmnEngine };
}